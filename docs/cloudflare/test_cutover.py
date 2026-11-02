import copy
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
import json
import tempfile
import subprocess
import base64
from contextlib import ExitStack

spec = importlib.util.spec_from_file_location('tfl_cutover', Path(__file__).with_name('cutover.py'))
cutover = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cutover)


class GuardControls(unittest.TestCase):
    def setUp(self):
        self.zone = {'id': cutover.ZONE, 'name': 'ezeikel.dev', 'status': 'active'}
        self.project = {'id': cutover.PROJECT, 'name': cutover.WORKER, 'accountId': cutover.TEAM, 'paused': None}
        self.project['targets'] = {'production': {'id': cutover.OLD_DEPLOYMENT, 'readyState': 'READY', 'meta': {'githubCommitSha': cutover.OLD_VERCEL_SOURCE}}}
        self.dns = [{'id': 'existing-mail', 'type': 'MX', 'name': 'ezeikel.dev', 'content': 'mail.example.invalid', 'priority': 10, 'ttl': 300}]

    def test_exact_pause_unpause_acknowledgements_accept_empty_text_or_json_only_after_exit_zero(self):
        owner = cutover.Owner('a' * 40, '/unused-no-io')
        for action in ('pause', 'unpause'):
            resource = '/v1/projects/' + cutover.PROJECT + '/' + action
            for raw in (b'', b'  \n', b'Project acknowledgement\n', b'{"acknowledged":true}'):
                with self.subTest(action=action, body=raw), patch.object(cutover.subprocess, 'run',
                        return_value=subprocess.CompletedProcess([], 0, raw, b'')) as command:
                    self.assertIsNone(owner.vercel(resource, method='POST', acknowledgement_only=True))
                    self.assertEqual(command.call_args.args[0][2], resource)
                    self.assertEqual(command.call_args.args[0][-2:], ['-X', 'POST'])
            with patch.object(cutover.subprocess, 'run', return_value=subprocess.CompletedProcess([], 1, b'', b'controlled failure')):
                with self.assertRaisesRegex(RuntimeError, 'failed with exit1'):
                    owner.vercel(resource, method='POST', acknowledgement_only=True)

    def test_acknowledgement_mode_refuses_any_other_method_project_or_resource_before_running(self):
        owner = cutover.Owner('a' * 40, '/unused-no-io')
        exact = '/v1/projects/' + cutover.PROJECT + '/pause'
        for resource, method in ((exact, 'GET'), (exact, 'DELETE'),
                ('/v1/projects/another-project/pause', 'POST'),
                (exact + '?unexpected=true', 'POST'),
                ('/v9/projects/' + cutover.PROJECT, 'POST')):
            with self.subTest(resource=resource, method=method), patch.object(cutover, 'run') as command:
                with self.assertRaisesRegex(RuntimeError, 'exact project pause/unpause POST'):
                    owner.vercel(resource, method=method, acknowledgement_only=True)
                command.assert_not_called()

    def test_get_metadata_still_requires_nonempty_valid_json_object(self):
        owner = cutover.Owner('a' * 40, '/unused-no-io')
        for raw in (b'', b' \n', b'Plain acknowledgement', b'{broken', b'null', b'[]', b'1', b'"text"',
                b'{}', b'{"result":{}}', b'{"result":null}', b'{"result":[]}'):
            with self.subTest(body=raw), patch.object(cutover, 'run', return_value=raw):
                with self.assertRaises((RuntimeError, ValueError)):
                    owner.vercel('/v9/projects/' + cutover.PROJECT)
        for raw in (b'{"id":"expected"}', b'{"result":{"id":"expected"}}'):
            with patch.object(cutover, 'run', return_value=raw):
                self.assertEqual(owner.vercel('/v9/projects/' + cutover.PROJECT), {'id': 'expected'})

    def execute_pause_fixture(self, acknowledgement, paused):
        owner = cutover.Owner('a' * 40, '/unused-no-io')
        version = '00000000-0000-0000-0000-000000000001'
        events, requests = [], []
        def command(args, **kwargs):
            if args[0] == 'bun': return ('Current Version ID: ' + version).encode()
            self.assertEqual(args[:2], ['vercel', 'api'])
            method = args[args.index('-X') + 1]
            requests.append((method, args[2]))
            if method == 'POST':
                self.assertEqual(args[2], '/v1/projects/' + cutover.PROJECT + '/pause')
                return acknowledgement
            self.assertEqual((method, args[2]), ('GET', '/v9/projects/' + cutover.PROJECT))
            return json.dumps({'paused': paused}).encode()
        with ExitStack() as stack:
            stack.enter_context(patch.object(cutover, 'source_gate'))
            stack.enter_context(patch.object(cutover, 'git', return_value='git@github.com:' + cutover.REPOSITORY + '.git'))
            stack.enter_context(patch.object(cutover, 'run', side_effect=command))
            for method in ('load_cloudflare', 'immutable_build', 'wait_public', 'accept_real_browser', 'publish_source', 'deploy_workflow', 'verify_public'):
                stack.enter_context(patch.object(owner, method))
            stack.enter_context(patch.object(owner, 'checkpoint', return_value={'dns': []}))
            stack.enter_context(patch.object(owner, 'save_inputs', return_value=({}, 'invented')))
            stack.enter_context(patch.object(owner, 'current_version', return_value=version))
            stack.enter_context(patch.object(owner, 'cf', return_value={'result': {'id': 'created-domain', 'hostname': cutover.HOST, 'service': cutover.WORKER}}))
            stack.enter_context(patch.object(owner, 'record', side_effect=lambda step, **_: events.append(step)))
            error = None
            try: owner.execute(None)
            except RuntimeError as failure: error = failure
        return events, requests, error

    def test_execute_uses_acknowledgement_mode_then_independent_pause_get(self):
        for acknowledgement in (b'', b'Project paused\n'):
            with self.subTest(body=acknowledgement):
                events, requests, error = self.execute_pause_fixture(acknowledgement, True)
                self.assertIsNone(error)
                self.assertEqual(requests, [('POST', '/v1/projects/' + cutover.PROJECT + '/pause'),
                    ('GET', '/v9/projects/' + cutover.PROJECT)])
                self.assertIn('vercel-paused-after-acceptance-no-deletion', events)
                self.assertEqual(events[-1], 'cutover-complete-retain-rollback-and-observation')
        events, requests, error = self.execute_pause_fixture(b'', False)
        self.assertIn('pause was not read back', str(error))
        self.assertEqual(len(requests), 2)
        self.assertNotIn('vercel-paused-after-acceptance-no-deletion', events)

    def rollback_unpause_fixture(self, acknowledgement, paused_after):
        owner = cutover.Owner('a' * 40, '/unused-no-io')
        owner.receipt.update(beforeImages={'dns': []}, steps=[{'step': 'exact-host-attached', 'domainId': 'recorded-domain'}])
        events, requests = [], []
        gets = 0
        def command(args, **kwargs):
            nonlocal gets
            if args[:2] == ['gh', 'api']: return b'{"workflow_runs":[],"total_count":0}'
            if args[:3] == ['gh', 'variable', 'set']: return b''
            self.assertEqual(args[:2], ['vercel', 'api'])
            method = args[args.index('-X') + 1]
            requests.append((method, args[2]))
            if method == 'POST':
                self.assertEqual(args[2], '/v1/projects/' + cutover.PROJECT + '/unpause')
                return acknowledgement
            self.assertEqual(args[2], '/v9/projects/' + cutover.PROJECT)
            gets += 1
            return json.dumps({'id': cutover.PROJECT, 'name': cutover.WORKER, 'accountId': cutover.TEAM,
                'paused': True if gets == 1 else paused_after}).encode()
        with ExitStack() as stack:
            stack.enter_context(patch.object(cutover, 'git', side_effect=lambda *args: owner.sha if args == ('rev-parse', 'HEAD') else ''))
            stack.enter_context(patch.object(cutover, 'run', side_effect=command))
            stack.enter_context(patch.object(owner, 'load_cloudflare'))
            stack.enter_context(patch.object(owner, 'pages', return_value=[]))
            stack.enter_context(patch.object(owner, 'cf', return_value={'result': {'enabled': True}}))
            stack.enter_context(patch.object(owner, 'record', side_effect=lambda step, **_: events.append(step)))
            error = None
            try: owner.rollback()
            except RuntimeError as failure: error = failure
        return events, requests, error

    def test_rollback_uses_acknowledgement_mode_then_independent_unpause_get(self):
        for acknowledgement in (b'', b'Project unpaused\n'):
            with self.subTest(body=acknowledgement):
                events, requests, error = self.rollback_unpause_fixture(acknowledgement, False)
                self.assertIsNone(error)
                self.assertEqual(requests, [('GET', '/v9/projects/' + cutover.PROJECT),
                    ('POST', '/v1/projects/' + cutover.PROJECT + '/unpause'), ('GET', '/v9/projects/' + cutover.PROJECT)])
                self.assertEqual(events[-1], 'owner-rollback-complete-baseline-dns-preserved')
        events, requests, error = self.rollback_unpause_fixture(b'', True)
        self.assertIn('unpause not read back', str(error))
        self.assertEqual(len(requests), 3)
        self.assertNotIn('owner-rollback-complete-baseline-dns-preserved', events)

    def test_positive_empty_intended_host_does_not_require_or_delete_existing_dns(self):
        cutover.validate_checkpoint(self.zone, self.dns, [], self.project)
        cutover.preserve_unrelated(self.dns, self.dns + [{'id': 'managed-new-host', 'type': 'AAAA', 'name': cutover.HOST}])

    def test_identity_dns_wildcard_domain_and_pause_refusals(self):
        for key, value in [('id', 'wrong'), ('name', 'wrong.invalid'), ('status', 'pending')]:
            with self.subTest(key=key), self.assertRaises(RuntimeError):
                cutover.validate_checkpoint({**self.zone, key: value}, self.dns, [], self.project)
        for key, value in [('id', 'wrong'), ('name', 'wrong'), ('accountId', 'wrong'), ('paused', True)]:
            with self.subTest(project=key), self.assertRaises(RuntimeError):
                cutover.validate_checkpoint(self.zone, self.dns, [], {**self.project, key: value})
        for host in [cutover.HOST, '*.tflchecker.ezeikel.dev', '*.ezeikel.dev']:
            with self.subTest(host=host), self.assertRaises(RuntimeError):
                cutover.validate_checkpoint(self.zone, self.dns + [{'name': host}], [], self.project)
        for domain in [{'hostname': cutover.HOST, 'service': 'someone-else'}, {'hostname': 'other.invalid', 'service': cutover.WORKER}]:
            with self.subTest(domain=domain), self.assertRaises(RuntimeError):
                cutover.validate_checkpoint(self.zone, self.dns, [domain], self.project)
        changed = copy.deepcopy(self.project)
        changed['targets']['production']['id'] = 'new-unreviewed-deployment'
        with self.assertRaises(RuntimeError):
            cutover.validate_checkpoint(self.zone, self.dns, [], changed)

    def test_attached_checkpoint_requires_the_one_exact_worker_host_pair(self):
        domain = {'id': 'created', 'hostname': cutover.HOST, 'service': cutover.WORKER}
        cutover.validate_checkpoint(self.zone, self.dns, [domain], self.project, attached=True)
        for domains in [[], [domain, domain], [{**domain, 'service': 'other'}]]:
            with self.subTest(domains=domains), self.assertRaises(RuntimeError):
                cutover.validate_checkpoint(self.zone, self.dns, domains, self.project, attached=True)

    def test_before_images_refuse_mail_loss_change_and_unrelated_addition(self):
        for after in [[], [{**self.dns[0], 'content': 'changed.invalid'}], self.dns + [{'id': 'new', 'name': 'unrelated.ezeikel.dev'}]]:
            with self.subTest(after=after), self.assertRaises(RuntimeError):
                cutover.preserve_unrelated(self.dns, after)

    def test_public_item_update_preserves_unrelated_fields_sections_and_metadata(self):
        original = {'id': 'existing-item', 'title': cutover.ITEM, 'category': 'SECURE_NOTE', 'tags': ['keep'],
                    'sections': [{'id': 'existing-env-id', 'label': 'env'}, {'id': 'other', 'label': 'unrelated'}],
                    'fields': [{'id': 'keep', 'label': 'SOME_OTHER_FIELD', 'type': 'CONCEALED', 'value': 'invented-unchanged', 'section': {'id': 'other'}}]}
        before = copy.deepcopy(original)
        values = {key: 'synthetic-public-config' for key in cutover.INPUTS}
        result = cutover.updated_item(original, values)
        self.assertEqual(original, before)
        self.assertEqual(result['fields'][0], before['fields'][0])
        self.assertEqual(result['sections'], before['sections'])
        self.assertEqual(result['tags'], before['tags'])
        for key in cutover.INPUTS:
            fields = [field for field in result['fields'] if field.get('label') == key]
            self.assertEqual(len(fields), 1)
            self.assertEqual(fields[0]['section']['id'], 'existing-env-id')
            self.assertEqual(fields[0]['value'], values[key])
        with self.assertRaises(RuntimeError):
            cutover.updated_item({**original, 'title': 'wrong'}, values)
        with self.assertRaises(RuntimeError):
            cutover.updated_item(original, {**values, cutover.INPUTS[0]: ''})

    def test_agent_or_pipe_refusal_happens_before_any_op_or_provider_command(self):
        with patch.object(cutover.sys.stdin, 'isatty', return_value=False), patch.object(cutover, 'run', side_effect=AssertionError('must not run')):
            with self.assertRaisesRegex(RuntimeError, 'interactive Terminal/PTY'):
                cutover.main(['--execute', 'a' * 40, '--fontawesome-ref', 'op://Chewy Bytes/Fontawesome/invented-field'])

    def test_source_pins_refuse_drift_dirty_wrong_branch_remote_or_unpublished_work(self):
        sha = 'a' * 40
        original = {('rev-parse', 'HEAD'): sha, ('status', '--porcelain=v1', '--untracked-files=all'): '',
                    ('branch', '--show-current'): cutover.BRANCH, ('remote', 'get-url', 'origin'): 'git@github.com:' + cutover.REPOSITORY + '.git'}
        def control(changes=None, wip=sha, main=cutover.OLD_MAIN, ancestor=True):
            values = {**original, **(changes or {})}
            def run(args, **kwargs):
                if args[0] == 'gh': return json.dumps({'object': {'sha': main if args[-1].endswith('/heads/main') else wip}}).encode()
                if args[:2] == ['git', 'merge-base'] and ancestor: return b''
                raise RuntimeError('not an ancestor')
            with patch.object(cutover, 'git', side_effect=lambda *args: values[args]), patch.object(cutover, 'run', side_effect=run):
                cutover.source_gate(sha, cutover.OLD_MAIN)
        control()
        for changes in [{('rev-parse', 'HEAD'): 'b' * 40}, {('status', '--porcelain=v1', '--untracked-files=all'): ' M src/main.tsx'},
                        {('branch', '--show-current'): 'main'}, {('remote', 'get-url', 'origin'): 'git@github.com:someone/else.git'}]:
            with self.subTest(changes=changes), self.assertRaises(RuntimeError): control(changes)
        for options in [{'wip': 'b' * 40}, {'main': 'b' * 40}, {'ancestor': False}]:
            with self.subTest(options=options), self.assertRaises(RuntimeError): control(**options)
        with self.assertRaises(RuntimeError): cutover.source_gate('short', cutover.OLD_MAIN)

    def test_complete_metadata_controls_reject_partial_or_duplicate_results(self):
        owner = cutover.Owner('a' * 40, '/unused-no-io')
        for response in [{'result': [], 'result_info': {'total_count': 1}},
                         {'result': [{'id': 'same'}, {'id': 'same'}], 'result_info': {'total_count': 2}}]:
            with self.subTest(response=response), patch.object(owner, 'cf', return_value=response), self.assertRaises(RuntimeError):
                owner.pages('/read-only-fixture')
        with patch.object(owner, 'cf', return_value={'result': [{'id': 'one'}], 'result_info': {'total_count': 1}}):
            self.assertEqual(owner.pages('/read-only-fixture'), [{'id': 'one'}])

    def test_private_build_diagnostics_redact_values_and_op_responses_are_never_persisted(self):
        secret = 'synthetic-never-real-credential'
        with tempfile.TemporaryDirectory() as directory:
            fake = subprocess.CompletedProcess(['bun'], 1, b'worker-id-public', ('failure ' + secret).encode())
            with patch.object(cutover, 'PRIVATE_LOG_DIRECTORY', Path(directory)), patch.object(cutover, 'REDACT_VALUES', {secret}), patch.object(cutover, 'LOG_NUMBER', 0), patch.object(cutover.subprocess, 'run', return_value=fake):
                with self.assertRaises(RuntimeError) as error: cutover.run(['bun', 'run', 'build'])
                self.assertNotIn(secret, str(error.exception))
                log = next(Path(directory).glob('*.log')).read_text()
                self.assertNotIn(secret, log)
                self.assertIn('worker-id-public', log)
                self.assertIn('<redacted>', log)
                op = subprocess.CompletedProcess(['op'], 1, secret.encode(), b'[ERROR] authorization timeout')
                with patch.object(cutover.subprocess, 'run', return_value=op), self.assertRaisesRegex(RuntimeError, 'missed, not refused'):
                    cutover.run(['op', 'read', 'op://invented'])
                self.assertEqual(len(list(Path(directory).glob('*.log'))), 1)

    def test_public_readiness_retries_dns_then_ssl_and_retains_each_transient(self):
        with tempfile.TemporaryDirectory() as directory:
            owner = cutover.Owner('a' * 40, directory)
            clock = [0.0]
            errors = [cutover.PublicNotReady(origin='https://' + cutover.HOST, path='', dns='DoH', curlExit=6, httpStatus='000'),
                      cutover.PublicNotReady(origin='https://' + cutover.HOST, path='', dns='DoH', curlExit=60, httpStatus='000'), None]
            with patch.object(owner, 'public_readiness_guard') as guard, patch.object(owner, 'verify_public', side_effect=errors) as verify, \
                 patch.object(cutover.time, 'monotonic', side_effect=lambda: clock[0]), \
                 patch.object(cutover.time, 'sleep', side_effect=lambda seconds: clock.__setitem__(0, clock[0] + seconds)):
                owner.wait_public('https://' + cutover.HOST, version='pinned-version', doh=True, maximum_seconds=20)
            self.assertEqual(guard.call_count, 3)
            self.assertEqual(verify.call_count, 3)
            pending = [x for x in owner.receipt['steps'] if x['step'] == 'public-propagation-pending']
            self.assertEqual([x['curlExit'] for x in pending], [6, 60])
            self.assertEqual(owner.receipt['steps'][-1]['attempts'], 3)
            self.assertFalse(hasattr(owner, '_public_deadline'))

    def test_public_readiness_expiry_is_bounded_without_mutation_or_retry_of_wrong_content(self):
        with tempfile.TemporaryDirectory() as directory:
            owner = cutover.Owner('a' * 40, directory)
            clock = [0.0]
            with patch.object(owner, 'public_readiness_guard'), patch.object(owner, 'verify_public', side_effect=cutover.PublicNotReady(curlExit=6)), \
                 patch.object(cutover.time, 'monotonic', side_effect=lambda: clock[0]), \
                 patch.object(cutover.time, 'sleep', side_effect=lambda seconds: clock.__setitem__(0, clock[0] + seconds)):
                with self.assertRaisesRegex(RuntimeError, 'expired'):
                    owner.wait_public('https://' + cutover.HOST, version='pinned-version', maximum_seconds=12)
            self.assertEqual(clock[0], 12)
            self.assertEqual(len(owner.receipt['steps']), 3)
            for failure in ['Public immutable content differs', 'Public HSTS differs']:
                with self.subTest(failure=failure), patch.object(owner, 'public_readiness_guard'), \
                     patch.object(owner, 'verify_public', side_effect=RuntimeError(failure)) as verify, \
                     patch.object(cutover.time, 'sleep', side_effect=AssertionError('must not retry')):
                    with self.assertRaisesRegex(RuntimeError, failure):
                        owner.wait_public('https://' + cutover.HOST, version='pinned-version')
                    self.assertEqual(verify.call_count, 1)
            with patch.object(owner, 'public_readiness_guard', side_effect=RuntimeError('ownership changed')), \
                 patch.object(owner, 'verify_public', side_effect=AssertionError('must not fetch')), \
                 patch.object(cutover.time, 'sleep', side_effect=AssertionError('must not retry')):
                with self.assertRaisesRegex(RuntimeError, 'ownership changed'):
                    owner.wait_public('https://' + cutover.HOST, version='pinned-version')

    def test_real_public_response_classifier_keeps_complete_bytes_headers_and_transport_controls(self):
        with tempfile.TemporaryDirectory() as directory:
            owner = cutover.Owner('a' * 40, directory)
            expected = b'<html>immutable-fixture</html>'
            manifest = {'files': {'index.html': cutover.hashlib.sha256(expected).hexdigest()}}
            (Path(directory) / 'artifact-manifest.json').write_text(json.dumps(manifest))
            def response(*, code='200', exit=0, body=expected, headers='cf-ray: fixture\nstrict-transport-security: max-age=63072000\n'):
                def fetch(args, **kwargs):
                    Path(args[args.index('--output') + 1]).write_bytes(body)
                    Path(args[args.index('--dump-header') + 1]).write_text(headers)
                    return subprocess.CompletedProcess(args, exit, code.encode(), b'')
                return fetch
            with patch.object(cutover.subprocess, 'run', side_effect=response()) as get:
                owner.verify_public('https://' + cutover.HOST)
                self.assertEqual(get.call_count, 5)
                self.assertTrue(all(call.args[0][call.args[0].index('--request') + 1] == 'GET' for call in get.call_args_list))
            for options in [{'code': '000', 'exit': 6}, {'code': '000', 'exit': 60}, {'code': '525'}]:
                with self.subTest(options=options), patch.object(cutover.subprocess, 'run', side_effect=response(**options)), self.assertRaises(cutover.PublicNotReady):
                    owner.verify_public('https://' + cutover.HOST)
            for options in [{'body': b'wrong established content'}, {'headers': 'server: Vercel\n'}, {'code': '403'}, {'exit': 23}]:
                with self.subTest(options=options), patch.object(cutover.subprocess, 'run', side_effect=response(**options)):
                    with self.assertRaises(RuntimeError) as error:
                        owner.verify_public('https://' + cutover.HOST)
                    self.assertNotIsInstance(error.exception, cutover.PublicNotReady)

    def test_readiness_guard_refuses_changed_version_and_changed_domain_id_before_any_get(self):
        owner = cutover.Owner('a' * 40, '/unused-no-io')
        owner.receipt.update(beforeImages={'dns': self.dns}, steps=[{'step': 'exact-host-attached', 'domainId': 'our-exact-domain'}])
        with patch.object(owner, 'current_version', return_value='different'), self.assertRaisesRegex(RuntimeError, 'version changed'):
            owner.public_readiness_guard('https://' + cutover.HOST, 'pinned')
        checkpoint = {'dns': self.dns, 'domains': [{'hostname': cutover.HOST, 'service': cutover.WORKER, 'id': 'somebody-elses-domain'}]}
        with patch.object(owner, 'current_version', return_value='pinned'), patch.object(owner, 'checkpoint', return_value=checkpoint), self.assertRaisesRegex(RuntimeError, 'identity changed'):
            owner.public_readiness_guard('https://' + cutover.HOST, 'pinned')

    def test_shared_npm_reference_uses_exact_named_field_and_verified_item_section_ids(self):
        item = {'title': 'Fontawesome', 'id': 'shared-item-id', 'vault': {'name': cutover.VAULT},
                'sections': [{'id': 'env-id', 'label': 'env'}], 'fields': [
                    {'id': 'npm-token-id', 'label': 'FONTAWESOME_NPM_AUTH_TOKEN', 'type': 'CONCEALED', 'value': 'invented-token', 'section': {'id': 'env-id'}},
                    {'id': 'login', 'label': 'password', 'type': 'CONCEALED', 'value': 'invented-login'}]}
        before = copy.deepcopy(item)
        expected = 'op://Chewy Bytes/shared-item-id/env-id/npm-token-id'
        self.assertEqual(cutover.fontawesome_reference(item), expected)
        self.assertEqual(cutover.fontawesome_reference(item, 'npm-token-id'), expected)
        self.assertEqual(cutover.fontawesome_reference(item, 'op://Chewy Bytes/Fontawesome/env/FONTAWESOME_NPM_AUTH_TOKEN'), expected)
        self.assertEqual(item, before)
        for selection in ['op://Other Vault/Fontawesome/env/npm-token-id', 'op://Chewy Bytes/Another Item/npm-token-id', 'missing', 'op://Chewy Bytes/Fontawesome/wrong-section/npm-token-id']:
            with self.subTest(selection=selection), self.assertRaises(RuntimeError): cutover.fontawesome_reference(item, selection)
        for changes in [{'title': 'other'}, {'id': ''}, {'vault': {'name': 'other'}}]:
            with self.subTest(changes=changes), self.assertRaises(RuntimeError): cutover.fontawesome_reference({**item, **changes})

    def test_generic_login_password_missing_empty_or_ambiguous_named_field_never_autoselects(self):
        base = {'title': 'Fontawesome', 'id': 'shared-item-id', 'vault': {'name': cutover.VAULT}, 'fields': []}
        named = {'id': 'npm', 'label': 'FONTAWESOME_NPM_AUTH_TOKEN', 'type': 'CONCEALED', 'value': 'invented-npm-secret'}
        generic = {'id': 'password', 'label': 'password', 'type': 'CONCEALED', 'value': 'invented-login-secret'}
        for fields in [[], [generic], [{**named, 'value': ''}], [named, {**named, 'id': 'npm2'}], [{**named, 'type': 'STRING'}]]:
            with self.subTest(fields=[x['id'] for x in fields]), self.assertRaises(cutover.FontawesomeSelectionRequired) as error:
                cutover.fontawesome_reference({**base, 'fields': fields})
            self.assertNotIn('invented-login-secret', str(error.exception))
            self.assertNotIn('invented-npm-secret', str(error.exception))
        # Explicit owner selection can identify a differently named existing npm field;
        # generic concealment/uniqueness alone never chooses it.
        self.assertEqual(cutover.fontawesome_reference({**base, 'fields': [generic]}, 'password'), 'op://Chewy Bytes/shared-item-id/password')
        with self.assertRaises(RuntimeError):
            cutover.fontawesome_reference({**base, 'fields': [{**named, 'value': ''}]}, 'npm')

    def test_dedicated_plaintext_response_is_bound_to_exact_listed_production_variable(self):
        key = cutover.INPUTS[1]
        listed = {'id': 'pinned-variable', 'key': key, 'target': ['production', 'preview', 'development'], 'type': 'encrypted', 'gitBranch': None, 'value': 'list-value-is-never-used'}
        dedicated = {**listed, 'value': 'invented-readable-app-id'}
        self.assertEqual(cutover.readable_production_value(key, listed, dedicated), dedicated['value'])
        for changed in [{'id': 'another-variable'}, {'key': 'OTHER_KEY'}, {'target': ['preview']}, {'target': ['production']},
                        {'gitBranch': 'other-branch'}, {'type': 'sensitive'}, {'value': ''}, {'value': None}]:
            with self.subTest(changed=changed), self.assertRaises(RuntimeError):
                cutover.readable_production_value(key, listed, {**dedicated, **changed})
        for changed in [{'id': ''}, {'key': 'OTHER_KEY'}, {'target': ['preview']}, {'gitBranch': 'branch'}, {'type': 'sensitive'}]:
            with self.subTest(listed=changed), self.assertRaises(RuntimeError):
                cutover.readable_production_value(key, {**listed, **changed}, dedicated)

    def test_json_and_base64_envelopes_are_rejected_without_value_in_diagnostics(self):
        row = {'id': 'pinned-variable', 'key': cutover.INPUTS[2], 'target': ['production'], 'type': 'encrypted'}
        envelope = json.dumps({'v': 1, 'c': 'invented-ciphertext', 'k': 'invented-wrapped-key', 'extra': True})
        values = [envelope, base64.b64encode(envelope.encode()).decode(), base64.urlsafe_b64encode(envelope.encode()).decode().rstrip('=')]
        for value in values:
            with self.subTest(kind='JSON' if value == envelope else 'base64'), self.assertRaisesRegex(RuntimeError, 'envelope refused') as error:
                cutover.readable_production_value(row['key'], row, {**row, 'value': value})
            self.assertNotIn(value, str(error.exception))
            self.assertNotIn('invented-ciphertext', str(error.exception))
        self.assertFalse(cutover.encrypted_envelope('plain-readable-key'))
        self.assertFalse(cutover.encrypted_envelope(json.dumps({'v': 1, 'c': 'ordinary JSON without k'})))

    def test_all_four_dedicated_inputs_validate_before_any_vault_or_github_write(self):
        owner = cutover.Owner('a' * 40, '/unused-no-io')
        shared = {'title': 'Fontawesome', 'id': cutover.FONTAWESOME_ITEM_ID, 'vault': {'name': cutover.VAULT},
                  'fields': [{'id': 'npm', 'label': 'FONTAWESOME_NPM_AUTH_TOKEN', 'type': 'CONCEALED', 'value': 'invented-registry-token'}]}
        rows = [{'id': 'id-' + key, 'key': key, 'target': ['production'], 'type': 'encrypted'} for key in cutover.INPUTS]
        fetched = []
        def vercel(resource):
            if resource.endswith('/env'): return {'envs': rows}
            row = next(x for x in rows if resource.endswith('/' + x['id']))
            fetched.append(row['key'])
            value = 'https://api.tfl.gov.uk' if row['key'] == cutover.INPUTS[0] else 'invented-readable-value'
            if row['key'] == cutover.INPUTS[-1]: value = json.dumps({'v': 1, 'c': 'invented-cipher', 'k': 'invented-wrap'})
            return {**row, 'value': value}
        def op(*args, **kwargs):
            if args == ('item', 'list', '--vault', cutover.VAULT):
                return json.dumps([{'title': 'Fontawesome', 'id': cutover.FONTAWESOME_ITEM_ID}]).encode()
            self.assertEqual(args, ('item', 'get', cutover.FONTAWESOME_ITEM_ID, '--vault', cutover.VAULT))
            return json.dumps(shared).encode()
        def run(args, **kwargs):
            self.assertEqual(args[:2], ['op', 'read'])
            return b'invented-registry-token'
        with patch.object(owner, 'op', side_effect=op), patch.object(owner, 'vercel', side_effect=vercel), patch.object(cutover, 'run', side_effect=run):
            with self.assertRaisesRegex(RuntimeError, 'envelope refused'):
                owner.save_inputs(None)
        self.assertEqual(fetched, list(cutover.INPUTS))

    def test_structured_env_note_extracts_only_the_exact_named_literal_without_editing(self):
        item = {'id': cutover.FONTAWESOME_ITEM_ID, 'title': 'Fontawesome', 'category': 'SECURE_NOTE', 'vault': {'name': cutover.VAULT},
                'fields': [{'id': 'notesPlain', 'label': 'notesPlain', 'type': 'STRING', 'value': ''}]}
        for text in ['FONTAWESOME_NPM_AUTH_TOKEN=literal-registry-key', 'export FONTAWESOME_NPM_AUTH_TOKEN="literal-registry-key"',
                     "# retained note\nOTHER_KEY=unchanged\nFONTAWESOME_NPM_AUTH_TOKEN='literal-registry-key'\n"]:
            candidate = copy.deepcopy(item);candidate['fields'][0]['value'] = text;before = copy.deepcopy(candidate)
            self.assertEqual(cutover.fontawesome_env_note(candidate), 'literal-registry-key')
            self.assertEqual(candidate, before)
            self.assertNotEqual(cutover.fontawesome_env_note(candidate), text)
        bad = ['literal-registry-key', '', 'FONTAWESOME_NPM_AUTH_TOKEN=', 'FONTAWESOME_NPM_AUTH_TOKEN="unterminated',
               'FONTAWESOME_NPM_AUTH_TOKEN="value\' ', 'FONTAWESOME_NPM_AUTH_TOKEN=${OTHER_KEY}',
               'FONTAWESOME_NPM_AUTH_TOKEN=$(command)', 'FONTAWESOME_NPM_AUTH_TOKEN=`command`',
               'FONTAWESOME_NPM_AUTH_TOKEN="key" # ambiguous comment', 'FONTAWESOME_NPM_AUTH_TOKEN=replace-me',
               'FONTAWESOME_NPM_AUTH_TOKEN=null', 'FONTAWESOME_NPM_AUTH_TOKEN=synthetic-key',
               'FONTAWESOME_NPM_AUTH_TOKEN=one\nFONTAWESOME_NPM_AUTH_TOKEN=two',
               'FONTAWESOME_NPM_AUTH_TOKEN_SUFFIX=wrong', '{"FONTAWESOME_NPM_AUTH_TOKEN":"not-env-syntax"}']
        for text in bad:
            candidate = copy.deepcopy(item);candidate['fields'][0]['value'] = text
            with self.subTest(case=bad.index(text)), self.assertRaises(RuntimeError) as error:
                cutover.fontawesome_env_note(candidate)
            if text: self.assertNotIn(text, str(error.exception))
        for change in [{'id': 'other'}, {'title': 'other'}, {'category': 'LOGIN'}, {'vault': {'name': 'other'}}]:
            with self.subTest(change=change), self.assertRaises(RuntimeError): cutover.fontawesome_env_note({**item, **change})
        duplicate = copy.deepcopy(item);duplicate['fields'] *= 2
        with self.assertRaises(RuntimeError): cutover.fontawesome_env_note(duplicate)

    def test_shared_item_duplicate_or_wrong_identity_stops_before_any_value_read_or_write(self):
        owner = cutover.Owner('a' * 40, '/unused-no-io')
        for rows in [[], [{'title': 'Fontawesome', 'id': 'wrong'}], [{'title': 'Fontawesome', 'id': cutover.FONTAWESOME_ITEM_ID}] * 2]:
            with self.subTest(rows=rows), patch.object(owner, 'op', return_value=json.dumps(rows).encode()) as op, \
                 patch.object(owner, 'vercel', side_effect=AssertionError('must not reach provider inputs')), \
                 patch.object(cutover, 'run', side_effect=AssertionError('must not read a credential')):
                with self.assertRaises(RuntimeError): owner.save_inputs(None)
                self.assertEqual(op.call_count, 1)

    def test_note_path_uses_parsed_credential_not_the_note_or_op_read_and_never_mutates_shared_item(self):
        with tempfile.TemporaryDirectory() as directory:
            owner = cutover.Owner('a' * 40, directory)
            token = 'literal-note-registry-key'
            shared = {'id': cutover.FONTAWESOME_ITEM_ID, 'title': 'Fontawesome', 'category': 'SECURE_NOTE', 'vault': {'name': cutover.VAULT},
                      'fields': [{'id': 'notesPlain', 'type': 'STRING', 'value': 'OTHER_KEY=retained\nFONTAWESOME_NPM_AUTH_TOKEN="' + token + '"\n'}]}
            before = copy.deepcopy(shared)
            rows = [{'id': key, 'key': key, 'type': 'encrypted', 'target': ['production']} for key in cutover.INPUTS]
            def op(*args, **kwargs):
                if args == ('item', 'list', '--vault', cutover.VAULT): return json.dumps([{'id': cutover.FONTAWESOME_ITEM_ID, 'title': 'Fontawesome'}]).encode()
                self.assertEqual(args, ('item', 'get', cutover.FONTAWESOME_ITEM_ID, '--vault', cutover.VAULT))
                return json.dumps(shared).encode()
            def provider(resource):
                if resource.endswith('/env'): return {'envs': rows}
                row = next(x for x in rows if resource.endswith('/' + x['id']))
                return {**row, 'value': json.dumps({'v': 1, 'c': 'cipher', 'k': 'wrap'})}
            with patch.object(owner, 'op', side_effect=op), patch.object(owner, 'vercel', side_effect=provider), \
                 patch.object(cutover, 'run', side_effect=AssertionError('note must not be sent to op read or any mutation')):
                with self.assertRaisesRegex(RuntimeError, 'envelope refused'): owner.save_inputs(None)
            self.assertEqual(shared, before)
            self.assertEqual(owner.receipt['steps'][-1]['step'], 'shared-registry-literal-env-note-read')
            serialized = json.dumps(owner.receipt)
            self.assertNotIn(token, serialized)
            self.assertNotIn('OTHER_KEY=retained', serialized)
            self.assertFalse(owner.receipt['steps'][-1]['sharedItemChanged'])

    def test_real_browser_receipt_cannot_claim_mock_human_stale_wrong_source_or_incomplete_acceptance(self):
        now = cutover.dt.datetime(2026, 11, 2, 2, 0, tzinfo=cutover.dt.timezone.utc)
        evidence = {'schema': 1, 'sourceSha': 'a' * 40, 'origin': 'https://' + cutover.HOST, 'operator': 'agent',
                    'humanObserved': False, 'mockedProviderCalls': False, 'checkedAt': '2026-11-02T01:59:00Z',
                    'checks': {x: True for x in ['actualLineStatus', 'placesSelection', 'journeyResults', 'journeyMap']}}
        result = cutover.verify_agent_browser_evidence(evidence, 'a' * 40, '2026-11-02T01:55:00Z', checked_now=now)
        self.assertFalse(result['humanObserved'])
        for changed in [{'sourceSha': 'b' * 40}, {'origin': 'https://wrong.invalid'}, {'operator': 'owner'}, {'humanObserved': True},
                        {'mockedProviderCalls': True}, {'checkedAt': '2026-11-02T01:54:00Z'}, {'checkedAt': '2026-11-02T02:01:00Z'},
                        {'checkedAt': '2026-11-02T01:59:00'}, {'checkedAt': 'invalid'}, {'checks': {'actualLineStatus': True}},
                        {'checks': {**evidence['checks'], 'journeyMap': False}}]:
            with self.subTest(changed=changed), self.assertRaises(RuntimeError):
                cutover.verify_agent_browser_evidence({**evidence, **changed}, 'a' * 40, '2026-11-02T01:55:00Z', checked_now=now)
        with self.assertRaises(RuntimeError):
            cutover.verify_agent_browser_evidence({**evidence, 'checkedAt': '2026-11-02T01:40:00Z'}, 'a' * 40, '2026-11-02T01:30:00Z', checked_now=now)

    def test_agent_acceptance_requires_private_actual_receipt_and_records_agent_scope(self):
        with tempfile.TemporaryDirectory() as directory:
            owner = cutover.Owner('a' * 40, directory, operator='agent')
            before = cutover.dt.datetime.now(cutover.dt.timezone.utc) - cutover.dt.timedelta(seconds=2)
            owner.receipt['steps'] = [{'step': 'exact-host-attached', 'at': before.isoformat()}]
            evidence = {'schema': 1, 'sourceSha': 'a' * 40, 'origin': 'https://' + cutover.HOST, 'operator': 'agent',
                        'humanObserved': False, 'mockedProviderCalls': False, 'checkedAt': cutover.now(),
                        'checks': {x: True for x in ['actualLineStatus', 'placesSelection', 'journeyResults', 'journeyMap']}}
            file = Path(directory) / 'browser-acceptance.private.json'
            file.write_text(json.dumps(evidence));file.chmod(0o600)
            with patch('builtins.input', return_value='STATUS AND JOURNEY VERIFIED'):
                owner.accept_real_browser()
            self.assertEqual(owner.receipt['steps'][-1]['step'], 'agent-observed-real-browser-status-journey-map-acceptance')
            self.assertFalse(owner.receipt['steps'][-1]['humanObserved'])
            file.chmod(0o644)
            with patch('builtins.input', return_value='STATUS AND JOURNEY VERIFIED'), self.assertRaisesRegex(RuntimeError, 'private regular'):
                owner.accept_real_browser()
            with patch('builtins.input', return_value='STATUS AND JOURNEY ACCEPTED'), self.assertRaisesRegex(RuntimeError, 'verification not supplied'):
                owner.accept_real_browser()


if __name__ == '__main__':
    unittest.main()
