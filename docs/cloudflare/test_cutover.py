import copy
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
import json
import tempfile
import subprocess

spec = importlib.util.spec_from_file_location('tfl_cutover', Path(__file__).with_name('cutover.py'))
cutover = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cutover)


class GuardControls(unittest.TestCase):
    def setUp(self):
        self.zone = {'id': cutover.ZONE, 'name': 'ezeikel.dev', 'status': 'active'}
        self.project = {'id': cutover.PROJECT, 'name': cutover.WORKER, 'accountId': cutover.TEAM, 'paused': None}
        self.project['targets'] = {'production': {'id': cutover.OLD_DEPLOYMENT, 'readyState': 'READY', 'meta': {'githubCommitSha': cutover.OLD_VERCEL_SOURCE}}}
        self.dns = [{'id': 'existing-mail', 'type': 'MX', 'name': 'ezeikel.dev', 'content': 'mail.example.invalid', 'priority': 10, 'ttl': 300}]

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
            with self.assertRaisesRegex(RuntimeError, 'real Terminal'):
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


if __name__ == '__main__':
    unittest.main()
