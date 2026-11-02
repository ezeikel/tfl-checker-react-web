import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { INPUTS, validateInputs, validateFiles, verifyManifest, validateBuildReceipt } from './artifact.mjs';

const env = Object.fromEntries(INPUTS.map(key => [key, key === 'VITE_TFL_API_URL' ? 'https://api.tfl.gov.uk' : 'public-fixture']));
test('production inputs are complete, explicit and pinned to the real TfL origin', () => {
  validateInputs(env, 'production');
  for (const key of INPUTS) {
    assert.throws(() => validateInputs({ ...env, [key]: '' }, 'production'));
    assert.throws(() => validateInputs({ ...env, [key]: 'undefined' }, 'production'));
    assert.throws(() => validateInputs({ ...env, [key]: 'synthetic-value' }, 'production'));
  }
  for (const url of ['http://api.tfl.gov.uk', 'https://wrong.invalid', 'https://api.tfl.gov.uk/path', 'https://user:password@api.tfl.gov.uk'])
    assert.throws(() => validateInputs({ ...env, VITE_TFL_API_URL: url }, 'production'));
});
test('raw JSON and base64 encrypted envelopes never become build inputs', () => {
  const envelope = JSON.stringify({ v: 1, c: 'invented-encrypted-bytes', k: 'invented-encrypted-key', extra: true });
  for (const value of [envelope, Buffer.from(envelope).toString('base64'), Buffer.from(envelope).toString('base64url')]) {
    for (const key of INPUTS) assert.throws(() => validateInputs({ ...env, [key]: value }, 'production'), /Encrypted build input envelope refused/);
  }
  validateInputs(env, 'production');
});
test('immutable artifact refuses modified, missing, extra or symlinked files and synthetic/source drift', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'tfl-artifact-control-'));
  try {
    mkdirSync(path.join(dir, 'assets'));
    writeFileSync(path.join(dir, 'index.html'), '<html><div id="root"></div><script src="/assets/app.js"></script></html>');
    writeFileSync(path.join(dir, 'assets/app.js'), 'export const fixture = true;');
    const manifest = { schema: 1, mode: 'production', sourceSha: 'a'.repeat(40), trackedTreeDirty: false, dotenvIsolation: 'private-empty-envDir', files: validateFiles(dir) };
    verifyManifest(dir, manifest, 'a'.repeat(40));
    assert.throws(() => verifyManifest(dir, manifest, 'b'.repeat(40)));
    assert.throws(() => verifyManifest(dir, { ...manifest, mode: 'synthetic' }, 'a'.repeat(40)));
    assert.throws(() => verifyManifest(dir, { ...manifest, trackedTreeDirty: true }, 'a'.repeat(40)));
    writeFileSync(path.join(dir, 'assets/app.js'), 'changed');
    assert.throws(() => verifyManifest(dir, manifest, 'a'.repeat(40)));
    writeFileSync(path.join(dir, 'assets/app.js'), 'export const fixture = true;');
    writeFileSync(path.join(dir, 'extra.txt'), 'extra');
    assert.throws(() => verifyManifest(dir, manifest, 'a'.repeat(40)));
    rmSync(path.join(dir, 'extra.txt'));
    rmSync(path.join(dir, 'assets/app.js'));
    assert.throws(() => validateFiles(dir));
    symlinkSync(path.join(dir, 'index.html'), path.join(dir, 'assets/app.js'));
    assert.throws(() => validateFiles(dir));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('build receipts reject unisolated, stale, mixed-mode and changed source outputs', () => {
  const state = { sourceSha: 'a'.repeat(40), sourceTree: 'b'.repeat(40), trackedTreeDirty: false };
  const files = { 'index.html': 'c'.repeat(64) };
  const receipt = { schema: 1, mode: 'production', ...state, dotenvIsolation: 'private-empty-envDir', publicInputNames: INPUTS, files };
  validateBuildReceipt(receipt, files, 'production', state);
  for (const change of [{ dotenvIsolation: 'source-dotenv' }, { mode: 'synthetic' }, { sourceSha: 'd'.repeat(40) }, { files: {} }, { trackedTreeDirty: true }])
    assert.throws(() => validateBuildReceipt({ ...receipt, ...change }, files, 'production', state));
});
