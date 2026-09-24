// Drive scene.html in headless Chromium and save frames / stills.
// Usage:
//   node render.mjs test                      -> a few film frames + all stills at 1280x720 into ./test
//   node render.mjs film <frames> <w> <h>     -> film frames into ./frames (frame_0000.png ...)
//   node render.mjs stills <w> <h>            -> stills into ./stills
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const [mode, ...rest] = process.argv.slice(2);
const BASE = process.env.SCENE_URL || 'http://127.0.0.1:8765/design/render/scene.html';

async function open(w, h) {
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`${BASE}?w=${w}&h=${h}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.sceneReady === true, null, { timeout: 120000 });
  return { browser, page };
}

async function grab(page, file) {
  const data = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
}

if (mode === 'test') {
  const [w, h] = [1280, 720];
  const { browser, page } = await open(w, h);
  fs.mkdirSync('test', { recursive: true });
  for (const t of [0, 0.35, 0.6, 1]) {
    const t0 = Date.now();
    await page.evaluate((t) => window.renderFilm(t), t);
    await grab(page, path.join('test', `film_${String(Math.round(t * 100)).padStart(3, '0')}.png`));
    console.log('film', t, Date.now() - t0, 'ms');
  }
  for (const s of ['closed', 'openTop', 'macro', 'side']) {
    await page.evaluate((s) => window.renderStill(s), s);
    await grab(page, path.join('test', `still_${s}.png`));
    console.log('still', s);
  }
  await browser.close();
} else if (mode === 'film') {
  const frames = Number(rest[0] || 180);
  const w = Number(rest[1] || 1920), h = Number(rest[2] || 1080);
  const { browser, page } = await open(w, h);
  fs.mkdirSync('frames', { recursive: true });
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const t = i / (frames - 1);
    await page.evaluate((t) => window.renderFilm(t), t);
    await grab(page, path.join('frames', `frame_${String(i).padStart(4, '0')}.png`));
    if (i % 20 === 0) console.log(`frame ${i}/${frames} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  await browser.close();
  console.log('done', ((Date.now() - t0) / 1000).toFixed(1), 's');
} else if (mode === 'stills') {
  const w = Number(rest[0] || 2400), h = Number(rest[1] || 1600);
  const { browser, page } = await open(w, h);
  fs.mkdirSync('stills', { recursive: true });
  for (const s of ['closed', 'openTop', 'side']) {
    await page.evaluate((s) => window.renderStill(s), s);
    await grab(page, path.join('stills', `${s}.png`));
    console.log('still', s);
  }
  await browser.close();
}
