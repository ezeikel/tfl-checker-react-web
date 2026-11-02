import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, validateFiles, validateInputs } from './artifact.mjs';

// Tests the actual built app, with all external traffic intercepted before JS runs.
// Never accepts an HTTP200/empty SPA root as hydration or provider acceptance.
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dist = path.join(ROOT, 'dist');
validateInputs(process.env, process.env.TFL_BUILD_MODE ?? 'synthetic');
const apiOrigin = new URL(process.env.VITE_TFL_API_URL).origin;
validateFiles(dist);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  let file = path.resolve(dist, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(dist + path.sep) || !existsSync(file) || url.pathname === '/') file = path.join(dist, 'index.html');
  assert(realpathSync(file).startsWith(realpathSync(dist) + path.sep));
  response.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const requests = { status: 0, journey: 0, googleScript: 0, blocked: [] };
const errors = [];
let currentPage;
const fixture = { journeys: [{ id: 'synthetic-journey', duration: 12, fare: { totalCost: 280 }, legs: [
  { mode: { id: 'tube' }, routeOptions: [{ name: 'Synthetic Line' }], departurePoint: { lat: 51.5, lon: -0.12, commonName: 'Synthetic Start' }, arrivalPoint: { lat: 51.52, lon: -0.1, commonName: 'Synthetic End' }, departureTime: '2026-11-01T12:00:00Z', duration: 12, instruction: { summary: 'Take the synthetic fixture train', steps: [] }, path: { stopPoints: [{ name: 'Synthetic Middle' }] } }
] }] };
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('**/*', async route => {
    const request = route.request(); const url = new URL(request.url());
    if (url.origin === origin) return route.continue();
    if (url.hostname === 'maps.googleapis.com' && url.pathname === '/maps/api/js') {
      assert(url.searchParams.get('key') === process.env.VITE_GOOGLE_MAPS_API_KEY, 'Google script key differs from the explicit build input');
      requests.googleScript++; return route.fulfill({ status: 200, contentType: 'text/javascript', body: readFileSync(path.join(ROOT, 'scripts/cloudflare/google-fixture.js'), 'utf8') });
    }
    if (url.origin === apiOrigin) {
      assert.equal(request.method(), 'GET');
      assert(url.searchParams.get('app_key') === process.env.VITE_TFL_APP_KEY, 'TfL key differs from the explicit build input');
      if (url.pathname.startsWith('/line/mode/')) { requests.status++; return route.fulfill({ headers: { 'access-control-allow-origin': origin }, json: [{ id: 'bakerloo', name: 'Synthetic Line', lineStatuses: [{ id: 1, statusSeverity: 10, statusSeverityDescription: 'Synthetic Good Service' }] }] }); }
      if (url.pathname.startsWith('/journey/journeyresults/')) { requests.journey++; assert.equal(url.pathname, '/journey/journeyresults/51.5,-0.12/to/51.52,-0.1'); assert(url.searchParams.get('app_id') === process.env.VITE_TFL_APP_ID, 'TfL app id differs'); return route.fulfill({ headers: { 'access-control-allow-origin': origin }, json: fixture }); }
    }
    // Fonts/CSS do not participate in these behavioral assertions. Everything else fails closed.
    if (url.hostname === 'use.typekit.net' || url.hostname === 'p.typekit.net') return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    requests.blocked.push({ host: url.hostname, path: url.pathname, method: request.method() });
    return route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  currentPage = page;
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.getByText('Synthetic Line', { exact: true }).waitFor();
  await page.getByText('Synthetic Good Service', { exact: true }).waitFor();
  assert.equal(await page.title(), 'TfL Checker - Status');
  await page.getByRole('link', { name: 'Plan a journey', exact: true }).click();
  await page.getByPlaceholder('Where are you coming from?').fill('Synthetic Start');
  await page.getByText('Synthetic Start, London', { exact: true }).click();
  await page.getByPlaceholder('Where are you going to?').fill('Synthetic End');
  await page.getByText('Synthetic End, London', { exact: true }).click();
  assert(new URL(page.url()).searchParams.has('from') && new URL(page.url()).searchParams.has('to'));
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByText('Suggested', { exact: true }).waitFor();
  await page.getByRole('link').filter({ hasText: '12' }).first().click();
  await page.getByText('Take the synthetic fixture train', { exact: true }).waitFor();
  await page.locator('[data-synthetic-map="ready"]').waitFor();
  const maps = await page.evaluate(() => window.__googleFixture);
  assert(maps.maps > 0 && maps.polylines.length > 0 && maps.fits > 0, 'Real app map adapter did not receive the synthetic route');
  assert.deepEqual(maps.polylines.at(-1), [{ lat: 51.5, lng: -0.12 }, { lat: 51.52, lng: -0.1 }], 'Map path must include both the actual departure and arrival');
  assert.equal(await page.title(), 'TfL Checker - Your Journey');
  // A hard refresh exercises the actual SPA fallback and URL geocoding contract.
  await page.goto(origin + '/journey-planner?from=51.5,-0.12&to=51.52,-0.1&fromPlaceId=synthetic-start&toPlaceId=synthetic-end');
  await page.getByRole('button', { name: 'Search', exact: true }).waitFor();
  await page.waitForFunction(() => document.querySelector('#start')?.value === 'Synthetic Start, London' && document.querySelector('#end')?.value === 'Synthetic End, London');
  assert(requests.status > 0 && requests.journey > 0 && requests.googleScript > 0);
  assert.deepEqual(errors, [], 'Hydrated app emitted page errors');
  assert.deepEqual(requests.blocked, [], 'Unexpected external app request (all real providers remain blocked)');
  console.log(JSON.stringify({ result: 'passed', origin: 'local-only', statusCalls: requests.status, journeyCalls: requests.journey, googleScriptsMocked: requests.googleScript, checks: ['hydrated line status', 'Places selection', 'query-state retention', 'journey search', 'journey details', 'map adapter path', 'hard-refresh deep link'], realProviderCalls: 0, realProviderAcceptance: false }));
} catch (error) {
  console.error(JSON.stringify({ result: 'failed', pageErrors: errors, requestMetadata: requests,
    googleFixture: currentPage ? await currentPage.evaluate(() => window.__googleFixture).catch(() => null) : null,
    visibleText: currentPage ? (await currentPage.locator('body').innerText().catch(() => '')).slice(0,2500) : null }));
  throw error;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
