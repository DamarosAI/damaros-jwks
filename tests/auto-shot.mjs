/* QA (throwaway): capture each scene in TWO states for the Brief 6 acceptance bar —
 *   <name>-a.png   : AUTONOMOUS (cursor never moved) — the process must already be alive
 *   <name>-cur.png : CURSOR     (pointer driven to a scene-relevant spot) — the verb must
 *                    modify the running process LOCALLY (no global scatter/chaos)
 * Full-fidelity ?hi path under headless SwiftShader. */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
function startServer() { return new Promise((res) => { const s = http.createServer(async (q, r) => { try { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/' || u === '') u = '/index.html'; const fp = path.join(ROOT, path.normalize(u).replace(/^(\.\.[/\\])+/, '')); r.writeHead(200, { 'content-type': TYPES[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); r.end(await readFile(fp)); } catch { r.writeHead(404).end('x'); } }); s.listen(0, '127.0.0.1', () => res(s)); }); }

// [index, name, cursorTarget(px) | 'circle' | null]
const scenes = [
  [0, 'hero', null],
  [1, 'protocol', [860, 405]],
  [2, 'evidence', [720, 405]],
  [3, 'screening', [870, 250]],
  [4, 'replay', [560, 405]],
  [5, 'trident', [560, 405]],
  [6, 'luna', 'circle'],
  [7, 'node', [560, 470]],
  [8, 'console', [560, 520]],
  [9, 'final', null],
];
const CX = 720, CY = 405;
const server = await startServer();
const base = `http://127.0.0.1:${server.address().port}/?hi=1`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.goto(base, { waitUntil: 'commit' });
await page.waitForFunction(() => !!window.DamarosSpace, null, { timeout: 15000 });
await page.waitForFunction(() => !document.getElementById('boot'), null, { timeout: 20000 }).catch(() => {});

for (const [i, name, tgt] of scenes) {
  // park the pointer off to a neutral resting spot, then arrive + let the autonomous cycle ramp in
  await page.mouse.move(CX, CY); await page.waitForTimeout(60);
  await page.evaluate((k) => window.DamarosSpace.go(k), i);
  await page.waitForTimeout(3500);
  await page.mouse.move(2, 2); await page.waitForTimeout(500);     // ensure NO cursor influence for the autonomous frame
  await page.screenshot({ path: path.join(ROOT, `auto-${name}-a.png`) });

  // cursor pass — drive the pointer to a scene-relevant spot (or a small orbit for Luna's trails)
  if (tgt === 'circle') {
    for (let s = 0; s < 30; s++) { const a = s / 30 * Math.PI * 2; await page.mouse.move(CX + Math.cos(a) * 130, CY + Math.sin(a) * 110); await page.waitForTimeout(35); }
  } else if (tgt) {
    await page.mouse.move(560, 360); await page.waitForTimeout(140);
    await page.mouse.move(tgt[0], tgt[1], { steps: 10 });
  } else {
    await page.mouse.move(600, 330); await page.waitForTimeout(120); await page.mouse.move(840, 470, { steps: 8 });
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ROOT, `auto-${name}-cur.png`) });
  console.log('captured', name);
}
await browser.close(); server.close();
console.log('done');
