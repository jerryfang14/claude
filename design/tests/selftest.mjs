// 10k-websites Phase 9 self-test. Run with the repo served at http://127.0.0.1:8765/
//   node design/tests/selftest.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const URL = 'http://127.0.0.1:8765/site/index.html';
const OUT = '/home/user/claude/design/tests/shots';
fs.mkdirSync(OUT, { recursive: true });
const report = [];
const log = (k, v) => { report.push(`${k}: ${v}`); console.log(k + ':', v); };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  return { ctx, page, errors };
}

async function scrollToProgress(page, p) {
  await page.evaluate((p) => {
    const hero = document.querySelector('.hero');
    const top = hero.getBoundingClientRect().top + window.scrollY;
    const span = hero.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * p, behavior: 'instant' });
  }, p);
  await page.waitForTimeout(900);
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

// ---------- desktop, light ----------
{
  const { ctx, page, errors } = await newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.classList.contains('film-ready') || document.documentElement.classList.contains('film-failed'), null, { timeout: 30000 });
  log('desktop film state', await page.evaluate(() => document.documentElement.className));
  for (const p of [0, 0.32, 0.62, 0.97]) {
    await scrollToProgress(page, p);
    const t = await page.evaluate(() => document.querySelector('.hero-video').currentTime.toFixed(2));
    const bands = await page.evaluate(() => [...document.querySelectorAll('.band')].map((b) => getComputedStyle(b).opacity).join(','));
    log(`hero p=${p}`, `video t=${t} bands=${bands}`);
    await page.screenshot({ path: `${OUT}/d-hero-${String(Math.round(p * 100)).padStart(3, '0')}.png` });
  }
  // scrub backward
  await scrollToProgress(page, 0.3);
  log('hero back to p=0.3', await page.evaluate(() => document.querySelector('.hero-video').currentTime.toFixed(2)));

  for (const id of ['story', 'menu', 'order', 'how', 'app', 'promises', 'faq', 'last']) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView({ behavior: 'instant', block: 'start' }), id);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${OUT}/d-${id}.png` });
  }
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/d-footer.png` });

  // ordering flow
  await page.evaluate(() => document.getElementById('menu').scrollIntoView({ behavior: 'instant' }));
  await page.click('button[data-id="chow-fun"]');
  await page.click('button[data-id="chow-fun"]');
  await page.click('button[data-id="hot-oil"]');
  log('nav count after 3 adds', await page.textContent('.nav-count'));
  await page.evaluate(() => document.getElementById('order').scrollIntoView({ behavior: 'instant' }));
  await page.click('label.chip:has(input[value="shrimp"]) span');
  await page.click('label.chip:has(input[value="ginger-scallion"]) span');
  log('builder summary', await page.evaluate(() => document.getElementById('build-name').textContent + ' / ' + document.getElementById('build-detail').textContent + ' / ' + document.getElementById('build-price').textContent));
  await page.click('#add-box');
  log('ticket total', await page.textContent('#ticket-total'));
  log('ticket ready', await page.textContent('#ticket-ready'));
  // empty submit -> inline errors
  await page.click('#order-form button[type="submit"]');
  log('errors shown', await page.evaluate(() => [...document.querySelectorAll('.field-error')].map((e) => e.textContent).join(' | ')));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/d-order-errors.png` });
  await page.fill('#f-name', 'Priya');
  await page.fill('#f-phone', '905 555 0142');
  await page.click('#order-form button[type="submit"]');
  await page.waitForTimeout(900);
  log('status after submit', await page.textContent('#ticket-status'));
  log('done title', await page.textContent('#done-title'));
  await page.screenshot({ path: `${OUT}/d-order-done.png` });
  // qty controls
  await page.click('#new-order');
  log('ticket after new order', await page.textContent('#ticket-total'));

  // FAQ toggle
  await page.click('#faq details:nth-of-type(2) summary');
  log('faq 2 open', await page.evaluate(() => document.querySelectorAll('#faq details')[1].open));

  log('desktop overflow px', await overflow(page));
  log('desktop console errors', errors.length ? errors.join(' || ') : 'none');
  await ctx.close();
}

// ---------- desktop, dark ----------
{
  const { ctx, page, errors } = await newPage({ colorScheme: 'dark' });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  for (const id of ['story', 'menu', 'order', 'app']) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView({ behavior: 'instant', block: 'start' }), id);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${OUT}/dark-${id}.png` });
  }
  log('dark console errors', errors.length ? errors.join(' || ') : 'none');
  await ctx.close();
}

// ---------- phone ----------
{
  const { ctx, page, errors } = await newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  log('phone classes', await page.evaluate(() => document.documentElement.className));
  await page.screenshot({ path: `${OUT}/m-hero.png` });
  for (const id of ['story', 'menu', 'order', 'how', 'app', 'promises', 'last']) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView({ behavior: 'instant', block: 'start' }), id);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${OUT}/m-${id}.png` });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('.burger');
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/m-menu-open.png` });
  log('phone menu expanded', await page.getAttribute('.burger', 'aria-expanded'));
  await page.keyboard.press('Escape');
  log('phone overflow px', await overflow(page));
  log('phone console errors', errors.length ? errors.join(' || ') : 'none');
  await ctx.close();
}

// ---------- reduced motion ----------
{
  const { ctx, page, errors } = await newPage({ reducedMotion: 'reduce' });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  log('reduced-motion classes', await page.evaluate(() => document.documentElement.className));
  log('reduced-motion hero height', await page.evaluate(() => document.querySelector('.hero').offsetHeight));
  await page.screenshot({ path: `${OUT}/rm-hero.png` });
  log('reduced console errors', errors.length ? errors.join(' || ') : 'none');
  await ctx.close();
}

// ---------- film blocked ----------
{
  const { ctx, page, errors } = await newPage();
  await page.route(/\.(mp4|webm)$/, (r) => r.abort());
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  log('film-blocked classes', await page.evaluate(() => document.documentElement.className));
  await scrollToProgress(page, 0.62);
  await page.screenshot({ path: `${OUT}/blocked-hero-062.png` });
  log('film-blocked page errors', errors.filter((e) => e.startsWith('pageerror')).join(' || ') || 'none');
  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/report.txt`, report.join('\n') + '\n');
