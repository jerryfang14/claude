// Render HTML files to PNG with headless Chromium.
// Usage:
//   node shoot.mjs page <file.html> <out.png> [width] [height] [scale]
//   node shoot.mjs elements <file.html> <selector> <outDir> [width] [scale]
//     (each matching element is saved as <outDir>/<data-shot attribute or index>.png)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';

const [mode, file, a, b, c, d, e] = process.argv.slice(2);
const url = 'file://' + path.resolve(file);

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'],
});

if (mode === 'page') {
  const width = Number(b || 1600);
  const height = Number(c || 900);
  const scale = Number(d || 1);
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: a, fullPage: false });
  console.log('saved', a);
} else if (mode === 'elements') {
  const selector = a;
  const outDir = b;
  const width = Number(c || 1600);
  const scale = Number(d || 1);
  fs.mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: scale });
  await page.goto(url, { waitUntil: 'networkidle' });
  if (process.env.EXTRA_CSS) await page.addStyleTag({ content: process.env.EXTRA_CSS });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const els = await page.$$(selector);
  for (let i = 0; i < els.length; i++) {
    const name = (await els[i].getAttribute('data-shot')) || String(i + 1).padStart(2, '0');
    const out = path.join(outDir, name + '.png');
    await els[i].screenshot({ path: out, omitBackground: process.env.OMIT_BG === '1' });
    console.log('saved', out);
  }
} else {
  console.error('unknown mode');
  process.exitCode = 1;
}

await browser.close();
