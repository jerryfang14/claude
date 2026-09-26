// Self-test: node design/tests/selftest.mjs  (serve site/ on :8765 first)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
import fs from 'fs';

const BASE = process.env.BASE || 'http://localhost:8765/';
const OUT = new URL('./shots/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const errors = [];
const log = (...a) => console.log(...a);

async function page(browser, opts, name) {
  const ctx = await browser.newContext(opts);
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errors.push(`[${name}] ${m.text()}`); });
  p.on('pageerror', e => errors.push(`[${name}] ${e.message}`));
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  return { ctx, p };
}
const settle = p => p.waitForTimeout(900);

const browser = await chromium.launch();

// 1. Desktop scroll-build hero
{
  const { ctx, p } = await page(browser, { viewport: { width: 1440, height: 900 } }, 'desktop');
  const span = await p.evaluate(() => document.querySelector('.hero').offsetHeight - innerHeight);
  for (const pr of [0, 0.3, 0.6, 0.97, 0.3]) {
    await p.evaluate(y => scrollTo(0, y), Math.round(pr * span));
    await settle(p);
    const s = await p.evaluate(() => ({
      bands: [...document.querySelectorAll('.band')].map(b => getComputedStyle(b).opacity),
      status: document.getElementById('status-text').textContent,
      pieces: document.querySelectorAll('.piece.on').length,
      prompt: document.getElementById('prompt-text').textContent.length
    }));
    log('hero p=' + pr, JSON.stringify(s));
    await p.screenshot({ path: `${OUT}hero-${pr}.png` });
  }
  // 2. Every section
  for (const id of ['premise', 'services', 'estimate', 'process', 'promises', 'work', 'faq', 'contact']) {
    await p.evaluate(id => { const el = document.getElementById(id); scrollTo(0, el.getBoundingClientRect().top + scrollY + (id === 'work' ? innerHeight * 0.8 : 0)); }, id);
    await p.waitForTimeout(1600);
    await p.screenshot({ path: `${OUT}d-${id}.png` });
  }
  // 3. Interactive flow
  await p.evaluate(() => document.getElementById('estimate').scrollIntoView());
  await p.fill('#r-team', '12');
  await p.dispatchEvent('#r-team', 'input');
  await p.waitForTimeout(1500);
  log('estimate', await p.textContent('#res-hours'), await p.textContent('#res-money'), await p.textContent('#res-weeks'));
  await p.click('#carry');
  await p.waitForTimeout(1200);
  log('carried message:', (await p.inputValue('#f-msg')).slice(0, 60) + '...');
  await p.click('#lead-form button[type=submit]');
  log('empty submit errors visible:', await p.isVisible('#e-name'), 'focused:', await p.evaluate(() => document.activeElement.id));
  await p.fill('#f-name', 'Maya Okafor');
  await p.fill('#f-email', 'maya@northside.co');
  await p.click('#lead-form button[type=submit]');
  log('success visible:', await p.isVisible('#success'), 'form hidden:', await p.isHidden('#lead-form'));
  await p.screenshot({ path: `${OUT}d-success.png` });
  await p.click('#again');
  log('form back:', await p.isVisible('#lead-form'));
  // FAQ
  await p.click('#faq summary');
  log('faq open:', await p.evaluate(() => document.querySelector('#faq details').open));
  // light theme
  await p.click('.theme-switch input[value=light]', { force: true });
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}light-hero.png` });
  await p.evaluate(() => document.getElementById('services').scrollIntoView());
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}light-services.png` });
  await p.evaluate(() => localStorage.removeItem('df-theme'));
  await ctx.close();
}

// 4. Phone
{
  const { ctx, p } = await page(browser, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }, 'phone');
  await p.waitForTimeout(5800);
  log('phone overflow:', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    'scrub:', await p.evaluate(() => document.querySelector('.hero').classList.contains('scrub')),
    'status:', await p.textContent('#status-text'));
  await p.screenshot({ path: `${OUT}m-hero.png` });
  await p.click('#burger');
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}m-menu.png` });
  await p.click('#burger');
  await p.waitForTimeout(700);
  for (const id of ['services', 'estimate', 'promises', 'work', 'contact']) {
    await p.evaluate(id => document.getElementById(id).scrollIntoView(), id);
    await p.waitForTimeout(1300);
    await p.screenshot({ path: `${OUT}m-${id}.png` });
  }
  await ctx.close();
}

// 5. Reduced motion
{
  const { ctx, p } = await page(browser, { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, 'reduced');
  log('reduced: scrub', await p.evaluate(() => document.querySelector('.hero').classList.contains('scrub')), 'status', await p.textContent('#status-text'));
  await p.screenshot({ path: `${OUT}reduced-hero.png` });
  await ctx.close();
}

await browser.close();
log(errors.length ? 'CONSOLE ERRORS:\n' + errors.join('\n') : 'console errors: 0');
