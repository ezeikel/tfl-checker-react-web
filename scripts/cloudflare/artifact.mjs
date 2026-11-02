import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, lstatSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const INPUTS = ['VITE_TFL_API_URL', 'VITE_TFL_APP_ID', 'VITE_TFL_APP_KEY', 'VITE_GOOGLE_MAPS_API_KEY'];
const hash = value => createHash('sha256').update(value).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

export function validateInputs(env, mode) {
  assert(['production', 'synthetic'].includes(mode), 'Explicit production or synthetic build mode required');
  for (const key of INPUTS) {
    assert(typeof env[key] === 'string' && env[key].trim(), `Missing build input: ${key}`);
    assert(!/^(undefined|null|%VITE_.*%)$/.test(env[key]), `Invalid build input: ${key}`);
    if (mode === 'production') assert(!env[key].startsWith('synthetic-'), `Synthetic production input: ${key}`);
  }
  const url = new URL(env.VITE_TFL_API_URL);
  assert(url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash, 'TfL URL must be a plain HTTPS origin');
  assert(url.pathname === '/' || url.pathname === '', 'TfL API URL cannot contain a path');
  if (mode === 'production') assert(url.hostname === 'api.tfl.gov.uk', 'Production TfL API host differs');
}

export function filesIn(directory) {
  const files = {};
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      assert(!lstatSync(file).isSymbolicLink(), 'Artifact symlinks are refused');
      if (entry.isDirectory()) walk(file);
      else {
        assert(entry.isFile(), 'Artifact contains a non-regular file');
        files[path.relative(directory, file).split(path.sep).join('/')] = hash(readFileSync(file));
      }
    }
  }
  walk(directory);
  return Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
}

export function validateFiles(directory) {
  const files = filesIn(directory);
  const html = readFileSync(path.join(directory, 'index.html'), 'utf8');
  assert(html.includes('<div id="root"></div>') && html.includes('</html>'), 'Missing complete SPA index');
  assert(!html.includes('%VITE_'), 'Unreplaced HTML build input');
  const refs = [...html.matchAll(/(?:src|href)="(\/(?:assets\/[^"?#]+|vite\.svg))"/g)].map(match => match[1].slice(1));
  assert(refs.some(file => /^assets\/.*\.js$/.test(file)), 'No built application module');
  for (const file of refs) assert(files[file], `Missing referenced asset: ${file}`);
  return files;
}

export function makeManifest(directory, mode, env = process.env) {
  validateInputs(env, mode);
  const dirty = git('status', '--porcelain=v1', '--untracked-files=no') !== '';
  if (mode === 'production') assert(!dirty, 'Production artifact requires a clean tracked tree');
  const files = validateFiles(directory);
  const state = { sourceSha: git('rev-parse', 'HEAD'), sourceTree: git('rev-parse', 'HEAD^{tree}'), trackedTreeDirty: dirty };
  validateBuildReceipt(JSON.parse(readFileSync(path.join(ROOT, '.cloudflare-build-receipt.json'), 'utf8')), files, mode, state);
  return { schema: 1, mode, ...state, dotenvIsolation: 'private-empty-envDir',
    publicInputNames: INPUTS, files, createdAt: new Date().toISOString() };
}

export function validateBuildReceipt(receipt, files, mode, state) {
  assert.equal(receipt.schema, 1);
  assert.equal(receipt.dotenvIsolation, 'private-empty-envDir', 'Build environment was not isolated');
  assert.equal(receipt.mode, mode, 'Build mode changed');
  assert.deepEqual(receipt.publicInputNames, INPUTS);
  assert.deepEqual(receipt.files, files, 'Stale or changed build receipt');
  for (const key of ['sourceSha', 'sourceTree', 'trackedTreeDirty']) assert.deepEqual(receipt[key], state[key], 'Build source changed');
}

export function verifyManifest(directory, manifest, expectedSha, { production = true } = {}) {
  assert(manifest.schema === 1 && manifest.sourceSha === expectedSha, 'Artifact source pin differs');
  if (production) assert(manifest.mode === 'production' && manifest.trackedTreeDirty === false && manifest.dotenvIsolation === 'private-empty-envDir', 'Only clean isolated production artifacts may be deployed');
  assert.deepEqual(validateFiles(directory), manifest.files, 'Artifact changed after its manifest was recorded');
  return true;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, modeOrSha] = process.argv.slice(2);
  const directory = path.join(ROOT, 'dist');
  const manifestFile = path.join(ROOT, '.cloudflare-artifact.json');
  if (command === 'inputs') validateInputs(process.env, modeOrSha);
  else if (command === 'record') writeFileSync(manifestFile, JSON.stringify(makeManifest(directory, modeOrSha), null, 2) + '\n');
  else if (command === 'verify') verifyManifest(directory, JSON.parse(readFileSync(manifestFile, 'utf8')), modeOrSha);
  else throw new Error('Usage: artifact.mjs inputs|record production|synthetic OR verify FULL_SHA');
  console.log(`Artifact ${command} passed; input values are not logged.`);
}
