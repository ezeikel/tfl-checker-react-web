import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { ROOT, INPUTS, validateInputs, validateFiles } from './artifact.mjs';

export async function isolatedBuild(builder, { mode, env = process.env } = {}) {
  validateInputs(env, mode);
  const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  const state = () => ({ sourceSha: git('rev-parse', 'HEAD'), sourceTree: git('rev-parse', 'HEAD^{tree}'),
    trackedTreeDirty: git('status', '--porcelain=v1', '--untracked-files=no') !== '' });
  const before = state();
  if (mode === 'production') assert.equal(before.trackedTreeDirty, false, 'Production source is dirty');
  const envDir = mkdtempSync(path.join(tmpdir(), 'tfl-empty-build-env-'));
  try {
    assert.deepEqual(readdirSync(envDir), []);
    // Public Vite5 API. Its own loadEnv reads only this empty directory.
    // Existing ignored dotenv files are preserved and never consulted by Vite.
    let isolationObserved = false;
    await builder({ root: ROOT, envDir, mode: 'production', emptyOutDir: true, plugins: [{
      name: 'verify-explicit-public-build-inputs',
      configResolved(config) {
        assert.equal(config.envDir, envDir, 'Vite did not use the private empty env directory');
        for (const key of INPUTS) assert.equal(config.env[key], env[key], `Vite input differs: ${key}`);
        isolationObserved = true;
      },
    }] });
    assert(isolationObserved, 'Actual Vite resolved-config isolation was not observed');
    assert.deepEqual(state(), before, 'Source changed during the build');
    const files = validateFiles(path.join(ROOT, 'dist'));
    const receipt = { schema: 1, mode, ...before, dotenvIsolation: 'private-empty-envDir', nodeVersion: process.version, publicInputNames: INPUTS, files };
    writeFileSync(path.join(ROOT, '.cloudflare-build-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
    return receipt;
  } finally { rmSync(envDir, { recursive: true, force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await isolatedBuild(build, { mode: process.env.TFL_BUILD_MODE ?? 'synthetic' });
}
