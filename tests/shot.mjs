/* QA: render the full-fidelity particle path (48k + bloom) under SwiftShader and
 * save PNGs of a few sections so we can SEE the brightness/forms. Not a test. */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };
function startServer() { return new Promise((res) => { const s = http.createServer(async (q, r) => { try { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/' || u === '') u = '/index.html'; const fp = path.join(ROOT, path.normalize(u).replace(/^(\.\.[/\\])+/, '')); r.writeHead(200, { 'content-type': TYPES[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); r.end(await readFile(fp)); } catch { r.writeHead(404).end('x'); } }); s.listen(0, '127.0.0.1', () => res(s)); }); }

const shots = [[0, '0-opening'], [1, '1-protocol'], [2, '2-evidence'], [8, '8-console'], [9, '9-final']];
const server = await startServer();
const base = `http://127.0.0.1:${server.address().port}/?hi=1`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.goto(base, { waitUntil: 'commit' });
await page.waitForFunction(() => !!window.DamarosSpace, null, { timeout: 15000 });
await page.waitForFunction(() => !document.getElementById('boot'), null, { timeout: 20000 }).catch(() => {});
for (const [i, name] of shots) {
  await page.evaluate((k) => window.DamarosSpace.go(k), i);
  await page.waitForTimeout(2600); // morph + world reveal
  // drive the cursor over the object so section-specific physics engage (velocity for trails/seam)
  await page.mouse.move(820, 330, { steps: 6 });
  await page.waitForTimeout(140);
  await page.mouse.move(690, 450, { steps: 10 });
  await page.waitForTimeout(950); // let the verb ease in
  await page.screenshot({ path: path.join(ROOT, `shot-${name}.png`) });
  console.log('shot', name);
}
await browser.close(); server.close();
console.log('done');
