#!/usr/bin/env python3
"""Owner-only, single-host static cutover. Importing this module performs no I/O.

Operational commands require a real Terminal and the exact reviewed source SHA.
No database, mail DNS, other hostname, key rotation or deletion is in scope.
"""
import argparse
import copy
import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request

ACCOUNT = '3b270a88f8cd0aaf0e9f28f6683a7a85'
ZONE = 'c824589f98e48c3451a8d14ced102351'
HOST = 'react.tflchecker.ezeikel.dev'
WORKER = 'tfl-checker-react-web'
PROJECT = 'QmS1JgNcrQbzfpSg8ArhM1yu3TgjiZoafu8W3i2ACBcrti'
TEAM = 'team_djQoDOSEHQB3fbm6aZ4QUJHQ'
REPOSITORY = 'ezeikel/tfl-checker-react-web'
OLD_MAIN = 'aac90c354af72ad853ef8bcca85af320898fc970'
OLD_DEPLOYMENT = 'dpl_5vPRwVDWckfzRgGLSUveeoyAzeVe'
OLD_VERCEL_SOURCE = 'ffbb3781c3952b82e55be917fd86487008d4b4cd'
BRANCH = 'wip/react-tfl-completion-20261101'
ROOT = Path(__file__).resolve().parents[2]
INPUTS = ('VITE_TFL_API_URL', 'VITE_TFL_APP_ID', 'VITE_TFL_APP_KEY', 'VITE_GOOGLE_MAPS_API_KEY')
ITEM = 'TFL Checker Web Prod'
VAULT = 'Chewy Bytes'
OP_ACCOUNT = 'my.1password.com'
PRIVATE_LOG_DIRECTORY = None
REDACT_VALUES = set()
LOG_NUMBER = 0


class PublicNotReady(RuntimeError):
    """Only bounded DNS/TLS/edge-readiness failures may be retried."""
    def __init__(self, **metadata):
        super().__init__('Public DNS/TLS/edge is not ready')
        self.metadata = metadata


def need(ok, message):
    if not ok:
        raise RuntimeError(message)


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def run(args, *, input=None, env=None, cwd=ROOT, timeout=90):
    global LOG_NUMBER
    timed_out = False
    try:
        result = subprocess.run(args, input=input, env=env, cwd=cwd, capture_output=True, timeout=timeout)
    except subprocess.TimeoutExpired as error:
        timed_out = True
        result = subprocess.CompletedProcess(args, -1, error.stdout or b'', error.stderr or b'')
    tool = Path(args[0]).name
    log_file = None
    # Never persist secret-returning op/Vercel/API responses. Retain redacted build/Git diagnostics.
    if PRIVATE_LOG_DIRECTORY and tool in {'bun', 'bunx', 'node', 'git'}:
        LOG_NUMBER += 1
        log_file = PRIVATE_LOG_DIRECTORY / f'tool-{LOG_NUMBER:03d}-{tool}.log'
        transcript = result.stdout + b'\n' + result.stderr
        for value in sorted(REDACT_VALUES, key=len, reverse=True):
            if value: transcript = transcript.replace(value.encode(), b'<redacted>')
        log_file.write_bytes(transcript)
    if result.returncode != 0:
        if timed_out:
            raise RuntimeError(f'{tool} exceeded its {timeout}s bound; inspect private metadata/logs before an owner retry')
        if tool == 'op' and b'authorization timeout' in result.stderr.lower():
            raise RuntimeError('1Password approval timed out: the prompt was missed, not refused. Inspect completed steps before an owner retry.')
        suffix = f'; redacted private log {log_file.name}' if log_file else ''
        raise RuntimeError(f'{tool} failed with exit{result.returncode}{suffix}; stopped without an automatic retry')
    return result.stdout


def git(*args):
    return run(['git', '--literal-pathspecs', *args]).decode().strip()


def source_gate(sha, remote_main):
    need(re.fullmatch('[0-9a-f]{40}', sha) is not None, 'A full reviewed SHA is required')
    need(git('rev-parse', 'HEAD') == sha, 'Local source SHA differs')
    need(git('status', '--porcelain=v1', '--untracked-files=all') == '', 'Source must be clean, including non-ignored files')
    need(git('branch', '--show-current') == BRANCH, 'Unexpected source branch')
    need(git('remote', 'get-url', 'origin') in {'git@github.com:' + REPOSITORY + '.git', 'https://github.com/' + REPOSITORY + '.git'}, 'Git remote identity differs')
    def remote_ref(branch):
        return json.loads(run(['gh', 'api', f'repos/{REPOSITORY}/git/ref/heads/' + branch]))['object']['sha']
    need(remote_ref(BRANCH) == sha, 'Reviewed WIP is not pushed at this SHA')
    need(remote_ref('main') == remote_main, 'Remote main changed; stop for review')
    run(['git', 'merge-base', '--is-ancestor', remote_main, sha])


def dns_fields(record):
    return {key: record.get(key) for key in ('id', 'type', 'name', 'content', 'ttl', 'proxied', 'priority', 'data')}


def validate_checkpoint(zone, dns, domains, project, *, attached=False):
    need(zone.get('id') == ZONE and zone.get('name') == 'ezeikel.dev' and zone.get('status') == 'active', 'Zone identity/status differs')
    need(project.get('id') == PROJECT and project.get('name') == WORKER and project.get('accountId') == TEAM, 'Vercel project/team differs')
    need(project.get('paused') is not True, 'Old Vercel must remain available before acceptance')
    covering = {HOST, '*.tflchecker.ezeikel.dev', '*.ezeikel.dev'}
    existing = [x for x in dns if x['name'] in covering]
    matches = [x for x in domains if x.get('hostname') == HOST or x.get('service') == WORKER]
    if attached:
        need(len(matches) == 1 and matches[0].get('hostname') == HOST and matches[0].get('service') == WORKER, 'Exact domain ownership differs')
        need(not any(x['name'] != HOST for x in existing), 'A covering wildcard appeared')
    else:
        need(not existing and not matches, 'Hostname/Worker is no longer unattached and DNS-empty')
        production = project.get('targets', {}).get('production', {})
        need(production.get('id') == OLD_DEPLOYMENT and production.get('readyState') == 'READY'
             and production.get('meta', {}).get('githubCommitSha') == OLD_VERCEL_SOURCE, 'Reviewed old production deployment changed')


def preserve_unrelated(before, after):
    original = {x['id']: dns_fields(x) for x in before}
    current = {x['id']: dns_fields(x) for x in after}
    need(all(current.get(key) == value for key, value in original.items()), 'An existing DNS record changed')
    need(all(key in original or value['name'] == HOST for key, value in current.items()), 'An unrelated DNS record appeared')


def updated_item(original, values):
    """Change exactly the four public production fields; preserve unrelated fields."""
    item = copy.deepcopy(original)
    need(item.get('title') == ITEM and item.get('category') == 'SECURE_NOTE', 'Unexpected canonical app item')
    need(set(values) == set(INPUTS) and all(isinstance(x, str) and x.strip() for x in values.values()), 'Production inputs are incomplete')
    sections = item.setdefault('sections', [])
    env_sections = [x for x in sections if x.get('label') == 'env']
    need(len(env_sections) <= 1, 'Duplicate env section')
    if not env_sections:
        sections.append({'id': 'env', 'label': 'env'})
    section_id = next(x['id'] for x in sections if x['label'] == 'env')
    fields = item.setdefault('fields', [])
    for key in INPUTS:
        matches = [x for x in fields if x.get('label') == key and (x.get('section') or {}).get('id') == section_id]
        need(len(matches) <= 1, f'Duplicate canonical field: {key}')
        if matches:
            matches[0].update(value=values[key], type='STRING')
        else:
            fields.append({'id': key.lower(), 'label': key, 'type': 'STRING', 'value': values[key], 'section': {'id': section_id}})
    return item


class Owner:
    def __init__(self, sha, directory):
        self.sha = sha
        self.directory = Path(directory)
        self.receipt = {'sourceSha': sha, 'hostname': HOST, 'worker': WORKER, 'account': ACCOUNT, 'zone': ZONE, 'steps': []}
        self.token = None

    def record(self, step, **metadata):
        self.receipt['steps'].append({'at': now(), 'step': step, **metadata})
        temporary = self.directory / '.receipt.tmp'
        with temporary.open('w') as stream:
            json.dump(self.receipt, stream, indent=2); stream.write('\n'); stream.flush(); os.fsync(stream.fileno())
        temporary.replace(self.directory / 'receipt.private.json')
        print(step, flush=True)

    def op(self, *args, input=None):
        return run(['op', *args, '--account', OP_ACCOUNT, '--format', 'json'], input=input, timeout=1800)

    def read_timeout(self, maximum):
        deadline = getattr(self, '_public_deadline', None)
        remaining = maximum if deadline is None else deadline - time.monotonic()
        need(remaining > 0, 'Public propagation wait expired; no mutations were retried')
        return min(maximum, remaining)

    def cf(self, method, resource, payload=None):
        need(self.token, 'Vaulted Cloudflare credential not loaded')
        body = None if payload is None else json.dumps(payload).encode()
        request = urllib.request.Request('https://api.cloudflare.com/client/v4' + resource, data=body,
            headers={'Authorization': 'Bearer ' + self.token, 'Content-Type': 'application/json'}, method=method)
        with urllib.request.urlopen(request, timeout=self.read_timeout(45)) as response:
            raw = response.read(8_388_609); need(len(raw) <= 8_388_608, 'Metadata response exceeded bound'); result = json.loads(raw)
        need(result.get('success') is True, 'Cloudflare request refused')
        return result

    def pages(self, resource):
        result = []
        for page in range(1, 21):
            separator = '&' if '?' in resource else '?'
            response = self.cf('GET', resource + f'{separator}page={page}&per_page=100')
            rows = response['result']; need(isinstance(rows, list), 'Unknown page shape'); result += rows
            info = response.get('result_info', {})
            if info.get('total_pages', 999) <= page or len(rows) < 100:
                if 'total_count' in info: need(len(result) == info['total_count'], 'Incomplete metadata listing')
                need(all(value.get('id') for value in result) and len({value['id'] for value in result}) == len(result), 'Duplicate/missing metadata identities')
                return result
        raise RuntimeError('Metadata pagination exceeded bound')

    def vercel(self, resource, method='GET'):
        raw = run(['vercel', 'api', resource, '--raw', '--scope', 'chewy-bytes', '--non-interactive', '-X', method],
            env={**os.environ, 'VERCEL_TELEMETRY_DISABLED': '1', 'NO_COLOR': '1'}, timeout=self.read_timeout(60))
        data = json.loads(raw); return data.get('result', data)

    def checkpoint(self, attached=False):
        zone = self.cf('GET', '/zones/' + ZONE)['result']
        dns = self.pages('/zones/' + ZONE + '/dns_records')
        domains = self.pages('/accounts/' + ACCOUNT + '/workers/domains')
        project = self.vercel('/v9/projects/' + PROJECT)
        validate_checkpoint(zone, dns, domains, project, attached=attached)
        subdomain = self.cf('GET', f'/accounts/{ACCOUNT}/workers/scripts/{WORKER}/subdomain')['result']
        need(subdomain.get('enabled') is True, 'workers.dev must stay enabled')
        settings = self.cf('GET', f'/accounts/{ACCOUNT}/workers/scripts/{WORKER}/settings')['result']
        bindings = settings.get('bindings', [])
        need({x['name'] for x in bindings} == {'ASSETS', 'CF_WEB_ANALYTICS_TOKEN'}, 'Unexpected Worker binding')
        need(all(x.get('text') == '' for x in bindings if x['name'] == 'CF_WEB_ANALYTICS_TOKEN'), 'Optional disabled analytics changed')
        schedules = self.cf('GET', f'/accounts/{ACCOUNT}/workers/scripts/{WORKER}/schedules')['result']
        need(isinstance(schedules, dict) and schedules.get('schedules') == [], 'Unexpected live schedule')
        production = project.get('targets', {}).get('production', {})
        return {'zone': zone, 'dns': dns, 'domains': domains, 'project': {'id': project['id'], 'name': project['name'], 'accountId': project['accountId'], 'paused': project.get('paused'),
                'production': {'id': production.get('id'), 'readyState': production.get('readyState'), 'sourceSha': production.get('meta', {}).get('githubCommitSha')}}}

    def save_inputs(self, fontawesome_ref):
        need(fontawesome_ref.startswith('op://Chewy Bytes/Fontawesome/'), 'Use the existing shared Fontawesome item reference')
        envs = self.vercel('/v9/projects/' + PROJECT + '/env')['envs']
        values = {}
        for key in INPUTS:
            matches = [x for x in envs if x.get('key') == key and 'production' in x.get('target', []) and not x.get('gitBranch')]
            need(len(matches) == 1 and matches[0].get('type') == 'encrypted', f'Exact readable production input unavailable: {key}')
            value = self.vercel(f'/v1/projects/{PROJECT}/env/' + matches[0]['id']).get('value')
            need(isinstance(value, str) and value.strip(), f'Unreadable production input: {key}')
            values[key] = value
        REDACT_VALUES.update(values.values())
        source_gate(self.sha, OLD_MAIN)
        input_environment = {key: value for key, value in os.environ.items() if key in {'PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL'}}
        run(['node', 'scripts/cloudflare/artifact.mjs', 'inputs', 'production'], env={**input_environment, **values})
        # The canonical app item holds only the app's four public build values.
        listed = json.loads(self.op('item', 'list', '--vault', VAULT))
        matches = [x for x in listed if x.get('title') == ITEM]
        need(len(matches) <= 1, 'Duplicate canonical app items')
        if matches:
            original = json.loads(self.op('item', 'get', matches[0]['id'], '--vault', VAULT))
            item = updated_item(original, values)
            source_gate(self.sha, OLD_MAIN)
            saved = json.loads(self.op('item', 'edit', original['id'], '--vault', VAULT, input=json.dumps(item).encode()))
        else:
            original = {'title': ITEM, 'category': 'SECURE_NOTE', 'sections': [], 'fields': []}
            source_gate(self.sha, OLD_MAIN)
            saved = json.loads(self.op('item', 'create', '--vault', VAULT, '-', input=json.dumps(updated_item(original, values)).encode()))
        verified = json.loads(self.op('item', 'get', saved['id'], '--vault', VAULT))
        env_ids = {x['id'] for x in verified.get('sections', []) if x.get('label') == 'env'}
        need(len(env_ids) == 1, 'Canonical env section readback differs')
        for key in INPUTS:
            fields = [x for x in verified['fields'] if x.get('label') == key and (x.get('section') or {}).get('id') in env_ids]
            need(len(fields) == 1 and fields[0].get('value') == values[key], f'Vault readback differs: {key}')
        self.record('vault-public-inputs-saved-and-read-verified', itemId=saved['id'], names=list(INPUTS))
        # Reads return directly into memory; no shared credential is duplicated into the app item.
        fontawesome = run(['op', 'read', fontawesome_ref, '--account', OP_ACCOUNT], timeout=1800).decode().strip()
        need(fontawesome, 'Shared registry credential is empty')
        REDACT_VALUES.add(fontawesome)
        source_gate(self.sha, OLD_MAIN)
        for key, value in values.items(): run(['gh', 'variable', 'set', key, '--repo', REPOSITORY], input=value.encode())
        run(['gh', 'variable', 'set', 'CLOUDFLARE_ACCOUNT_ID', '--repo', REPOSITORY], input=ACCOUNT.encode())
        run(['gh', 'variable', 'set', 'CLOUDFLARE_CUTOVER', '--repo', REPOSITORY], input=b'false')
        for key, value in {'CLOUDFLARE_API_TOKEN': self.token, 'FONTAWESOME_NPM_AUTH_TOKEN': fontawesome}.items():
            run(['gh', 'secret', 'set', key, '--repo', REPOSITORY], input=value.encode())
        actual = json.loads(run(['gh', 'api', f'repos/{REPOSITORY}/actions/variables']))
        need(len(actual['variables']) == actual.get('total_count') and len(actual['variables']) < 100, 'Incomplete GitHub variable readback')
        by_name = {x['name']: x['value'] for x in actual['variables']}
        need(all(by_name.get(key) == value for key, value in values.items()) and by_name.get('CLOUDFLARE_CUTOVER') == 'false'
             and by_name.get('CLOUDFLARE_ACCOUNT_ID') == ACCOUNT, 'GitHub public input readback differs')
        self.record('github-inputs-set-public-values-read-verified', secretNames=['CLOUDFLARE_API_TOKEN', 'FONTAWESOME_NPM_AUTH_TOKEN'], deployGate='false')
        return values, fontawesome

    def load_cloudflare(self):
        account = run(['op', 'read', 'op://Chewy Bytes/Shared Cloudflare/env/CLOUDFLARE_ACCOUNT_ID', '--account', OP_ACCOUNT], timeout=1800).decode().strip()
        need(account == ACCOUNT, 'Vaulted Cloudflare account differs')
        self.token = run(['op', 'read', 'op://Chewy Bytes/Shared Cloudflare/env/CLOUDFLARE_API_TOKEN', '--account', OP_ACCOUNT], timeout=1800).decode().strip()
        need(self.token, 'Vaulted Cloudflare token is empty')
        REDACT_VALUES.add(self.token)

    def immutable_build(self, values, fontawesome):
        source_gate(self.sha, OLD_MAIN)
        need(run(['bun', '--version']).decode().strip() == '1.3.13', 'Use the checked Bun1.3.13 build tool')
        need(run(['node', '--version']).decode().strip() == 'v22.23.3', 'Use Node22.23.3, matching the checked deployment workflow')
        # Build processes get only system basics and the exact selected public inputs.
        environment = {key: value for key, value in os.environ.items() if key in {'PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'TMPDIR', 'LANG', 'LC_ALL'}}
        environment.update(CI='true', HUSKY='0', TFL_BUILD_MODE='production', **values)
        # Bun PM can inspect dotenv even with --no-env-file. A private clean clone contains
        # only the pinned tracked source; it never copies the owner's ignored local files.
        build_root = self.directory / 'source'
        run(['git', 'clone', '--no-local', '--no-hardlinks', str(ROOT), str(build_root)], cwd=self.directory, env=environment)
        run(['git', 'checkout', '--detach', self.sha], cwd=build_root, env=environment)
        need(run(['git', 'rev-parse', 'HEAD'], cwd=build_root).decode().strip() == self.sha, 'Private source clone differs')
        for filename in ('.env', '.env.local', '.env.production', '.env.production.local', '.env.test', '.env.test.local', '.env.development', '.env.development.local'):
            need(not (build_root / filename).exists(), 'Tracked dotenv is forbidden in the private build clone')
        run(['bun', '--no-env-file', 'install', '--frozen-lockfile'], cwd=build_root,
            env={**environment, 'FONTAWESOME_NPM_AUTH_TOKEN': fontawesome}, timeout=600)
        for command in [['node', 'scripts/cloudflare/artifact.mjs', 'inputs', 'production'], ['bun', '--no-env-file', 'run', 'check-types'], ['bun', '--no-env-file', 'run', 'test'], ['bun', '--no-env-file', 'run', 'build'],
                        ['node', 'scripts/cloudflare/artifact.mjs', 'record', 'production'], ['bun', '--no-env-file', 'run', 'test:browser'],
                        ['node', 'scripts/cloudflare/artifact.mjs', 'verify', self.sha]]:
            run(command, cwd=build_root, env=environment, timeout=600)
        manifest = json.loads((build_root / '.cloudflare-artifact.json').read_text())
        need(manifest.get('mode') == 'production' and manifest.get('sourceSha') == self.sha and not manifest.get('trackedTreeDirty'), 'Build provenance differs')
        need(manifest.get('sourceTree') == git('rev-parse', 'HEAD^{tree}'), 'Build source tree differs')
        shutil.copytree(build_root / 'dist', self.directory / 'artifact')
        (self.directory / 'artifact-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
        worker_source = run(['git', 'show', self.sha + ':worker.ts'])
        (self.directory / 'worker.ts').write_bytes(worker_source)
        config = json.loads(re.sub(r'^\s*//.*$', '', (ROOT / 'wrangler.jsonc').read_text(), flags=re.MULTILINE))
        config['main'] = str(self.directory / 'worker.ts')
        config['assets']['directory'] = str(self.directory / 'artifact')
        config['account_id'] = ACCOUNT
        config.pop('env', None)  # staged upload cannot attach the production hostname
        need('routes' not in config and 'triggers' not in config, 'Staging config contains routes or schedules')
        (self.directory / 'staging.json').write_text(json.dumps(config, indent=2) + '\n')
        self.receipt['artifactFiles'] = manifest['files']
        self.record('clean-production-artifact-and-mocked-browser-checks-passed', artifactFiles=len(manifest['files']), workerSha256=hashlib.sha256(worker_source).hexdigest())

    def current_version(self):
        result = self.cf('GET', f'/accounts/{ACCOUNT}/workers/scripts/{WORKER}/deployments')['result']
        deployments = result.get('deployments', [])
        need(deployments, 'No live Worker deployment found')
        latest = max(deployments, key=lambda value: value.get('created_on', ''))
        versions = latest.get('versions', [])
        need(len(versions) == 1 and versions[0].get('percentage') == 100, 'Unexpected split Worker deployment')
        return versions[0]['version_id']

    def verify_public(self, origin, *, doh=False):
        need(origin in {'https://' + HOST, 'https://' + WORKER + '.chewybytes.workers.dev'}, 'Unexpected public origin')
        manifest = json.loads((self.directory / 'artifact-manifest.json').read_text())
        expected = dict(manifest['files'])
        expected.update({'': manifest['files']['index.html'], 'journey-planner?from=51.5,-0.12&to=51.52,-0.1': manifest['files']['index.html'],
                         'journey': manifest['files']['index.html'], '__cutover_missing_route__': manifest['files']['index.html']})
        for filename, digest in expected.items():
            with tempfile.TemporaryDirectory(prefix='http-', dir=self.directory) as temporary:
                body = Path(temporary) / 'body'; headers = Path(temporary) / 'headers'
                args = ['curl', '--silent', '--show-error', '--request', 'GET', '--connect-timeout', '5', '--max-time', '15',
                        '--max-filesize', '8388608', '--proto', '=https', '--output', str(body), '--dump-header', str(headers), '--write-out', '%{response_code}']
                if doh: args += ['--doh-url', 'https://cloudflare-dns.com/dns-query']
                try:
                    response = subprocess.run(args + [origin + '/' + filename], cwd=ROOT, capture_output=True, timeout=self.read_timeout(20))
                except subprocess.TimeoutExpired:
                    raise PublicNotReady(origin=origin, path=filename, dns='DoH' if doh else 'system', transport='bounded-timeout') from None
                code = response.stdout.decode().strip()
                metadata = {'origin': origin, 'path': filename, 'dns': 'DoH' if doh else 'system', 'curlExit': response.returncode, 'httpStatus': code}
                if response.returncode in {6, 7, 28, 35, 51, 60}:
                    raise PublicNotReady(**metadata)
                need(response.returncode == 0, 'Public GET failed with non-readiness curl exit ' + str(response.returncode))
                if code in {'404', '421', '425', '502', '503', '504', '525', '526'}:
                    raise PublicNotReady(**metadata)
                response_headers = {key.strip().lower(): value.strip() for line in headers.read_text().splitlines() if ':' in line for key, value in [line.split(':', 1)]}
                need(code == '200' and hashlib.sha256(body.read_bytes()).hexdigest() == digest, 'Public immutable content differs at ' + filename)
                need('cf-ray' in response_headers and not any(key.startswith('x-vercel') for key in response_headers), 'Public response is not the expected Cloudflare origin')
                need(response_headers.get('strict-transport-security') == 'max-age=63072000', 'Public HSTS differs')
        self.record('immutable-public-content-verified', origin=origin, dns='DoH' if doh else 'system', paths=len(expected))

    def public_readiness_guard(self, origin, version):
        need(self.current_version() == version, 'Worker version changed during public readiness wait')
        if origin == 'https://' + HOST:
            checkpoint = self.checkpoint(attached=True)
            preserve_unrelated(self.receipt['beforeImages']['dns'], checkpoint['dns'])
            ids = [x['domainId'] for x in self.receipt['steps'] if x['step'] == 'exact-host-attached']
            matches = [x for x in checkpoint['domains'] if x.get('hostname') == HOST]
            need(len(ids) == 1 and len(matches) == 1 and matches[0].get('id') == ids[0], 'Attached domain identity changed during readiness wait')
        else:
            subdomain = self.cf('GET', f'/accounts/{ACCOUNT}/workers/scripts/{WORKER}/subdomain')['result']
            need(subdomain.get('enabled') is True, 'workers.dev changed during readiness wait')

    def wait_public(self, origin, *, version, doh=False, maximum_seconds=300, poll_seconds=5):
        """Retry GET-only propagation failures; established wrong content/ownership is fatal."""
        need(0 < maximum_seconds <= 300 and 0 < poll_seconds <= 10, 'Unexpected readiness wait bound')
        started = time.monotonic()
        self._public_deadline = started + maximum_seconds
        attempt = 0
        try:
            while True:
                self.read_timeout(20)
                attempt += 1
                self.public_readiness_guard(origin, version)
                try:
                    self.verify_public(origin, doh=doh)
                except PublicNotReady as error:
                    self.record('public-propagation-pending', attempt=attempt, elapsedSeconds=round(time.monotonic() - started, 3), **error.metadata)
                    time.sleep(min(poll_seconds, self.read_timeout(poll_seconds)))
                    continue
                self.record('public-propagation-ready', origin=origin, dns='DoH' if doh else 'system', attempts=attempt, elapsedSeconds=round(time.monotonic() - started, 3))
                return
        finally:
            del self._public_deadline

    def publish_source(self):
        source_gate(self.sha, OLD_MAIN)
        run(['git', 'push', 'origin', 'HEAD:main'], timeout=1800)  # ordinary hooks, no force/bypass
        found = json.loads(run(['gh', 'api', f'repos/{REPOSITORY}/git/ref/heads/main']))
        need(found.get('object', {}).get('sha') == self.sha, 'Main push was not independently confirmed')
        self.record('ordinary-main-fast-forward-published', sourceSha=self.sha)
        # The existing registered main is clean and pinned; never reset/stash it.
        need(git('rev-parse', 'main') == OLD_MAIN, 'Local main moved; sync pending, no local overwrite')
        run(['git', 'fetch', 'origin', 'main'])
        need(git('rev-parse', 'origin/main') == self.sha, 'Fresh remote main differs')
        run(['git', 'switch', 'main']); run(['git', 'merge', '--ff-only', self.sha])
        run(['git', 'branch', '--set-upstream-to=origin/main', 'main']); run(['git', 'switch', BRANCH])
        self.record('registered-main-synchronized-without-reset', sourceSha=self.sha)

    def deploy_workflow(self):
        run(['gh', 'variable', 'set', 'CLOUDFLARE_CUTOVER', '--repo', REPOSITORY], input=b'true')
        def runs():
            data = json.loads(run(['gh', 'run', 'list', '--repo', REPOSITORY, '--workflow', 'deploy-cloudflare.yml', '--branch', 'main', '--commit', self.sha,
                                  '--event', 'workflow_dispatch', '--limit', '100', '--json', 'databaseId,status,conclusion,headSha,headBranch']))
            need(len(data) < 100, 'Workflow list exceeded bound')
            return data
        previous = {x['databaseId'] for x in runs()}
        run(['gh', 'workflow', 'run', 'deploy-cloudflare.yml', '--repo', REPOSITORY, '--ref', 'main'])
        selected = None
        for _ in range(60):
            fresh = [x for x in runs() if x['databaseId'] not in previous]
            need(len(fresh) <= 1, 'Ambiguous new deploy run; inspect without redispatching')
            if fresh: selected = fresh[0]; break
            time.sleep(2)
        need(selected, 'New deploy run not found; do not dispatch again blindly')
        self.record('owner-deploy-workflow-dispatched-once', runId=selected['databaseId'])
        run(['gh', 'run', 'watch', str(selected['databaseId']), '--repo', REPOSITORY, '--exit-status'], timeout=1200)
        verified = json.loads(run(['gh', 'run', 'view', str(selected['databaseId']), '--repo', REPOSITORY, '--json', 'headSha,headBranch,status,conclusion,jobs']))
        need(verified['headSha'] == self.sha and verified['headBranch'] == 'main' and verified['conclusion'] == 'success', 'Exact-source deploy did not succeed')
        need(any(step.get('name') == 'Deploy' and step.get('conclusion') == 'success' for job in verified['jobs'] for step in job.get('steps', [])), 'Deploy step did not run')
        self.record('exact-source-production-workflow-passed', runId=selected['databaseId'])

    def execute(self, fontawesome_ref):
        source_gate(self.sha, OLD_MAIN)
        need(git('remote', 'get-url', 'origin') in {'git@github.com:' + REPOSITORY + '.git', 'https://github.com/' + REPOSITORY + '.git'}, 'Git remote identity differs')
        self.load_cloudflare()
        before = self.checkpoint()
        self.receipt['beforeImages'] = before
        self.record('read-only-preflight-and-before-images-saved')
        source_gate(self.sha, OLD_MAIN)
        values, fontawesome = self.save_inputs(fontawesome_ref)
        self.immutable_build(values, fontawesome)
        # Upload the retained production artifact; normal Git hooks can later rebuild locally without changing it.
        source_gate(self.sha, OLD_MAIN)
        deployed = run(['bun', '--no-env-file', 'x', 'wrangler@4.151.3', 'deploy', '--config', str(self.directory / 'staging.json'), '--message', 'Reviewed React TFL source ' + self.sha],
            env={**os.environ, 'CLOUDFLARE_ACCOUNT_ID': ACCOUNT, 'CLOUDFLARE_API_TOKEN': self.token, 'WRANGLER_SEND_METRICS': 'false'}, timeout=600)
        ids = re.findall(r'Current Version ID:\s*([0-9a-f-]{36})', re.sub(r'\x1b\[[0-9;]*m', '', deployed.decode()))
        need(len(ids) == 1 and self.current_version() == ids[0], 'Uploaded/current staging Worker version differs')
        staged_version = ids[0]
        self.record('exact-reviewed-staging-version-read-verified', versionId=staged_version)
        self.wait_public('https://' + WORKER + '.chewybytes.workers.dev', version=staged_version)
        source_gate(self.sha, OLD_MAIN)
        boundary = self.checkpoint()
        need(self.current_version() == staged_version, 'Staged Worker changed at the write boundary')
        need({x['id']: dns_fields(x) for x in boundary['dns']} == {x['id']: dns_fields(x) for x in before['dns']}, 'DNS changed before the write boundary')
        attached = self.cf('PUT', f'/accounts/{ACCOUNT}/workers/domains', {'hostname': HOST, 'service': WORKER, 'zone_id': ZONE, 'environment': 'production'})['result']
        need(attached.get('hostname') == HOST and attached.get('service') == WORKER, 'Attach response differs; inspect private receipt, do not retry')
        self.record('exact-host-attached', domainId=attached['id'])
        after = self.checkpoint(attached=True); preserve_unrelated(before['dns'], after['dns'])
        self.receipt['afterAttachDns'] = after['dns']
        self.record('preexisting-dns-and-workers-dev-preserved')
        self.wait_public('https://' + HOST, version=staged_version, doh=True)
        self.wait_public('https://' + HOST, version=staged_version)
        print('Open https://' + HOST + '/ and check actual line status, select a journey and open its map. These are owner client checks, not automated provider acceptance.')
        need(input('After the real client checks pass, type STATUS AND JOURNEY ACCEPTED: ') == 'STATUS AND JOURNEY ACCEPTED', 'Owner functional acceptance not given; Vercel remains available')
        self.record('owner-manual-status-journey-map-acceptance', attestation=True, automatedProviderAcceptance=False)
        self.publish_source()
        self.deploy_workflow()
        deployed_version = self.current_version()
        self.wait_public('https://' + HOST, version=deployed_version, doh=True)
        self.wait_public('https://' + HOST, version=deployed_version)
        final = self.checkpoint(attached=True); preserve_unrelated(before['dns'], final['dns'])
        self.vercel('/v1/projects/' + PROJECT + '/pause', method='POST')
        project = self.vercel('/v9/projects/' + PROJECT)
        need(project.get('paused') is True, 'Vercel pause was not read back')
        self.record('vercel-paused-after-acceptance-no-deletion')
        self.verify_public('https://' + HOST)
        self.record('cutover-complete-retain-rollback-and-observation', workersDevKept=True)

    def rollback(self):
        """Explicit owner backout, never automatic: remove only our exact new host."""
        need(self.receipt.get('hostname') == HOST and self.receipt.get('worker') == WORKER and
             self.receipt.get('zone') == ZONE and self.receipt.get('account') == ACCOUNT, 'Rollback receipt identity differs')
        need(git('rev-parse', 'HEAD') == self.sha and git('status', '--porcelain=v1', '--untracked-files=all') == '', 'Run the unchanged reviewed source for rollback')
        before = self.receipt.get('beforeImages')
        need(isinstance(before, dict), 'Before-images unavailable')
        need(not any(x['name'] in {HOST, '*.tflchecker.ezeikel.dev', '*.ezeikel.dev'} for x in before['dns']), 'Rollback baseline was not an empty intended host')
        ids = [x.get('domainId') for x in self.receipt['steps'] if x.get('step') == 'exact-host-attached']
        need(len(ids) == 1 and ids[0], 'A single recorded attached-domain identity is required')
        self.load_cloudflare()
        domains = self.pages('/accounts/' + ACCOUNT + '/workers/domains')
        matches = [x for x in domains if x.get('hostname') == HOST or x.get('service') == WORKER]
        need(not matches or len(matches) == 1 and matches[0].get('id') == ids[0] and matches[0].get('hostname') == HOST and matches[0].get('service') == WORKER,
             'Current domain is not the exact object this attempt created')
        current_dns = self.pages('/zones/' + ZONE + '/dns_records')
        preserve_unrelated(before['dns'], current_dns)
        runs = json.loads(run(['gh', 'api', f'repos/{REPOSITORY}/actions/runs?branch=main&per_page=100']))
        need(len(runs['workflow_runs']) == runs['total_count'] and len(runs['workflow_runs']) < 100, 'Rollback workflow listing is incomplete')
        need(not any(x.get('name') == 'Deploy Cloudflare' and x.get('status') != 'completed' for x in runs['workflow_runs']), 'A deploy is queued/running; stop before rollback')
        print('Rollback restores the original DNS-empty hostname and unpauses the old Vercel default URLs. It does not promise the missing custom hostname will serve Vercel.')
        run(['gh', 'variable', 'set', 'CLOUDFLARE_CUTOVER', '--repo', REPOSITORY], input=b'false')
        if matches:
            self.cf('DELETE', f'/accounts/{ACCOUNT}/workers/domains/' + ids[0])
            self.record('owner-rollback-exact-created-domain-detached', domainId=ids[0])
        remaining = self.pages('/accounts/' + ACCOUNT + '/workers/domains')
        need(not any(x.get('hostname') == HOST or x.get('service') == WORKER for x in remaining), 'Domain detach not verified')
        after_dns = self.pages('/zones/' + ZONE + '/dns_records')
        preserve_unrelated(before['dns'], after_dns)
        need(not any(x['name'] == HOST for x in after_dns), 'Managed host DNS remains; no unrecorded DNS deletion attempted')
        project = self.vercel('/v9/projects/' + PROJECT)
        need(project.get('id') == PROJECT and project.get('name') == WORKER and project.get('accountId') == TEAM, 'Rollback Vercel identity differs')
        if project.get('paused') is True:
            self.vercel('/v1/projects/' + PROJECT + '/unpause', method='POST')
        need(self.vercel('/v9/projects/' + PROJECT).get('paused') is not True, 'Vercel unpause not read back')
        subdomain = self.cf('GET', f'/accounts/{ACCOUNT}/workers/scripts/{WORKER}/subdomain')['result']
        need(subdomain.get('enabled') is True, 'workers.dev was not preserved')
        self.record('owner-rollback-complete-baseline-dns-preserved', mainNotReverted=True, workersDevKept=True)


def main(argv=None):
    global PRIVATE_LOG_DIRECTORY
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument('--execute', metavar='FULL_SHA')
    action.add_argument('--rollback', metavar='PRIVATE_RECEIPT')
    parser.add_argument('--fontawesome-ref', help='Exact existing shared Fontawesome field op:// reference; no value in argv')
    args = parser.parse_args(argv)
    need(sys.stdin.isatty() and sys.stdout.isatty(), 'Run this owner helper in a real Terminal, not an agent or a pipe')
    need(os.geteuid() != 0, 'Run as the signed-in owner, not root')
    node_bin = Path.home() / '.nvm/versions/node/v22.23.3/bin'
    need((node_bin / 'node').is_file(), 'The checked Node22.23.3 installation is required')
    os.environ['PATH'] = str(node_bin) + os.pathsep + os.environ.get('PATH', '')
    os.umask(0o077)
    home = Path.home() / '.cutover'; home.mkdir(exist_ok=True)
    lock_fd = os.open(home / '.react-tfl-completion.lock', os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    if args.execute:
        need(args.fontawesome_ref, 'A shared Fontawesome field reference is required')
        audit = tempfile.mkdtemp(prefix='react-tfl-', dir=home)
        owner = Owner(args.execute, audit)
    else:
        receipt = Path(args.rollback).expanduser()
        stat = receipt.lstat()
        need(not receipt.is_symlink() and stat.st_uid == os.getuid() and stat.st_mode & 0o077 == 0, 'Use the original owner-private receipt')
        need(receipt.resolve().parent.parent == home.resolve() and receipt.name == 'receipt.private.json', 'Unexpected receipt location')
        data = json.loads(receipt.read_text())
        owner = Owner(data['sourceSha'], receipt.parent); owner.receipt = data; audit = str(receipt.parent)
    print('Private evidence: ' + audit)
    PRIVATE_LOG_DIRECTORY = Path(audit) / 'redacted-tool-logs'
    PRIVATE_LOG_DIRECTORY.mkdir(exist_ok=True, mode=0o700)
    try:
        if args.execute: owner.execute(args.fontawesome_ref)
        else: owner.rollback()
    except Exception as error:
        # Exact tool output is deliberately omitted; values must not appear in terminal logs.
        owner.record('STOP', errorType=type(error).__name__, message=str(error) if isinstance(error, RuntimeError) else 'Tool/network error; inspect metadata before resuming')
        print('STOP. No automatic retry/rollback. Vercel is paused only if the receipt says so. Do not repeat completed stages blindly.', file=sys.stderr)
        return 1
    finally:
        os.close(lock_fd)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
