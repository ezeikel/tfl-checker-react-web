import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('./worker.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { default: worker } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));

test('HTTP redirects preserve path/query and never read assets', async () => {
  const response = await worker.fetch(new Request('http://react.tflchecker.ezeikel.dev/journey-planner?from=51.5,-0.12'), { ASSETS: { fetch() { throw new Error('assets must not run'); } } });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), 'https://react.tflchecker.ezeikel.dev/journey-planner?from=51.5,-0.12');
  assert.equal(response.headers.get('strict-transport-security'), 'max-age=63072000');
});
test('HTTPS and Range requests reach the exact asset binding; disabled analytics stays disabled', async () => {
  const request = new Request('https://tfl-checker-react-web.chewybytes.workers.dev/assets/app.js?x=1', { headers: { range: 'bytes=0-3' } });
  const response = await worker.fetch(request, { CF_WEB_ANALYTICS_TOKEN: '', ASSETS: { async fetch(received) { assert.equal(received, request); return new Response('part', { status: 206, headers: { 'content-type': 'text/javascript', 'content-range': 'bytes 0-3/10' } }); } } });
  assert.equal(response.status, 206); assert.equal(await response.text(), 'part');
  assert.equal(response.headers.get('content-range'), 'bytes 0-3/10');
  assert.equal(response.headers.get('strict-transport-security'), 'max-age=63072000');
});
test('SPA fallback is configured explicitly, no domain/cron/database is silently activated', () => {
  const config = JSON.parse(readFileSync(new URL('./wrangler.jsonc', import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, ''));
  assert.equal(config.name, 'tfl-checker-react-web'); assert.equal(config.workers_dev, true);
  assert.equal(config.assets.not_found_handling, 'single-page-application');
  assert.equal(config.assets.run_worker_first, true); assert.equal(config.assets.html_handling, 'none');
  assert.equal(config.vars.CF_WEB_ANALYTICS_TOKEN, '');
  for (const field of ['routes', 'triggers', 'd1_databases', 'durable_objects', 'r2_buckets']) assert.equal(config[field], undefined);
});
