// Self-test for the Double Fang site.
//   python3 -m http.server 8765 -d site &
//   PW=$(npm root -g)/playwright node design/tests/selftest.mjs
// Screenshots land in design/tests/shots/. The run exits 1 if any check fails.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');

const BASE = process.env.BASE || 'http://localhost:8765/';
const OUT = new URL('./shots/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const errors = [], outside = new Set(), fails = [];
let passed = 0;
const check = (name, ok, detail = '') => { if (ok) passed++; else fails.push(`${name} ${detail}`); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`); };
const CONSENT = () => { try { localStorage.setItem('df-consent', JSON.stringify({ v: 1, analytics: false, t: Date.now() })); } catch (e) {} window.DF_NO_MAIL = true; };

const browser = await chromium.launch();
async function open(name, opts, { path = '', consent = true } = {}) {
  const ctx = await browser.newContext(opts);
  if (consent) await ctx.addInitScript(CONSENT); else await ctx.addInitScript(() => { window.DF_NO_MAIL = true; });
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errors.push(`[${name}] ${m.text()}`); });
  p.on('pageerror', e => errors.push(`[${name}] ${e.message}`));
  p.on('request', r => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) outside.add(u); });
  await p.goto(BASE + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  return p;
}
const shot = (p, n) => p.screenshot({ path: `${OUT}${n}.png` });
const jump = (p, sel) => p.evaluate(s => document.querySelector(s).scrollIntoView({ behavior: 'instant' }), sel);
async function scrub(p, sel, stageSel, f) {
  await p.evaluate(([s, st, f]) => {
    const el = document.querySelector(s), stage = document.querySelector(st);
    scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.offsetHeight - stage.offsetHeight) * f, behavior: 'instant' });
  }, [sel, stageSel, f]);
  await p.waitForTimeout(700);
}
// Globe tiles never sit still, so aim at where the tile is right now instead of waiting for it to settle.
const center = (p, sel) => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
async function clickMoving(p, sel) { let c = await center(p, sel); await p.mouse.move(c.x, c.y); await p.waitForTimeout(200); c = await center(p, sel); await p.mouse.click(c.x, c.y); }
const DESK = { viewport: { width: 1440, height: 900 } };
const PHONE = { viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };

// ---------- 1. Desktop: every section and every interaction ----------
{
  const p = await open('desktop', DESK);

  for (const [f, band, status] of [[0, 0, 'Reading your brief'], [0.3, 1, 'Writing the copy'], [0.6, 2, 'Laying out sections'], [0.97, 3, 'Live']]) {
    await scrub(p, '.hero', '.stage', f);
    const s = await p.evaluate(() => ({ bands: [...document.querySelectorAll('.band')].map(b => +getComputedStyle(b).opacity), status: document.getElementById('status-text').textContent }));
    check(`hero at ${f}`, s.bands[band] === 1 && s.bands.filter(o => o > 0).length === 1 && s.status === status, JSON.stringify(s));
    await shot(p, `d-hero-${Math.round(f * 100)}`);
  }

  await jump(p, '#premise'); await p.waitForTimeout(700); await shot(p, 'd-premise');
  check('premise words light up', await p.evaluate(() => document.querySelectorAll('#premise-text .w.lit').length) > 5);

  // Fog + portal
  await scrub(p, '#portal', '.portal-stage', 0);
  const fogAlpha = (x, y) => p.evaluate(([x, y]) => { const c = document.getElementById('fog'); return c.getContext('2d').getImageData(Math.round(x * c.width), Math.round(y * c.height), 1, 1).data[3]; }, [x, y]);
  check('fog is painted', await fogAlpha(0.2, 0.75) > 150);
  await p.waitForTimeout(4300);
  check('finger wrote "hi" in the fog', await fogAlpha(0.33, 0.5) < 30 && await fogAlpha(0.6, 0.58) < 30 && await fogAlpha(0.2, 0.75) > 150);
  await shot(p, 'd-portal-hi');
  const hole = await (await p.$('#porthole')).boundingBox();
  for (let i = 0; i < 9; i++) {
    const y = hole.y + hole.height * (0.12 + i * 0.095);
    await p.mouse.move(hole.x + hole.width * 0.1, y);
    await p.mouse.move(hole.x + hole.width * 0.9, y, { steps: 10 });
  }
  await p.waitForTimeout(300);
  check('wiping clears the fog', await p.evaluate(() => document.getElementById('porthole').classList.contains('clear')));
  check('fog button flips', (await p.textContent('#fog-btn')) === 'Fog it up again');
  await p.click('#fog-btn');
  check('fog comes back on request', await p.evaluate(() => !document.getElementById('porthole').classList.contains('clear')) && await fogAlpha(0.5, 0.5) > 150);
  await p.click('#fog-btn');
  check('button clears the fog (keyboard path)', await p.evaluate(() => document.getElementById('porthole').classList.contains('clear')));
  await p.waitForTimeout(1000); await shot(p, 'd-portal-clear');
  const clipAt = async f => { await scrub(p, '#portal', '.portal-stage', f); return p.evaluate(() => ({ clip: document.getElementById('portal-world').style.clipPath, head: +getComputedStyle(document.getElementById('world-head')).opacity })); };
  const mid = await clipAt(0.5); await shot(p, 'd-portal-50');
  const end = await clipAt(1); await shot(p, 'd-portal-100');
  check('portal opens with scroll', /circle\((\d+)/.test(mid.clip) && +mid.clip.match(/circle\(([\d.]+)/)[1] > 260 && end.clip === 'none' && end.head === 1, JSON.stringify({ mid, end }));

  await jump(p, '.world-body'); await p.waitForTimeout(1600); await shot(p, 'd-bento');
  check('chat demo plays', await p.evaluate(() => document.querySelectorAll('#chat .msg').length) > 0);

  // 3D stack
  const stackAt = async f => { await scrub(p, '#inside', '.inside-stage', f); return p.evaluate(() => ({ ghost: document.querySelectorAll('.sheet.ghost').length, focus: [...document.querySelectorAll('.sheet')].findIndex(s => s.classList.contains('focus')), cap: [...document.querySelectorAll('.cap')].findIndex(c => c.classList.contains('on')), z: [...document.querySelectorAll('.sheet')].map(s => new DOMMatrix(s.style.transform).m43) })); };
  const s0 = await stackAt(0); await shot(p, 'd-inside-0');
  const s3 = await stackAt(0.55); await shot(p, 'd-inside-55');
  const s9 = await stackAt(1); await shot(p, 'd-inside-100');
  check('stack starts closed', s0.cap === 0 && s0.focus === -1 && Math.abs(s0.z[4] - s0.z[0]) < 2, JSON.stringify(s0));
  check('stack opens and focuses the agent layer', s3.cap === 3 && s3.focus === 2 && s3.ghost === 2 && s3.z[4] - s3.z[0] > 250, JSON.stringify(s3));
  check('stack closes again', s9.cap === 6 && s9.focus === -1 && s9.ghost === 0 && Math.abs(s9.z[4] - s9.z[0]) < 2, JSON.stringify(s9));

  // Estimate
  await jump(p, '#estimate'); await p.waitForTimeout(900);
  await p.fill('#r-team', '12'); await p.dispatchEvent('#r-team', 'input'); await p.waitForTimeout(1500);
  check('estimate recalculates', (await p.textContent('#res-hours')) === '2,765' && (await p.textContent('#res-weeks')) === '69');
  await shot(p, 'd-estimate');
  for (const id of ['process', 'promises']) { await jump(p, '#' + id); await p.waitForTimeout(1200); await shot(p, 'd-' + id); }

  // Hover reveal
  await jump(p, '#work'); await p.waitForTimeout(700);
  const row = await (await p.$('.build:nth-child(2) .build-row')).boundingBox();
  await p.mouse.move(row.x + 260, row.y + row.height / 2);
  await p.mouse.move(row.x + 380, row.y + row.height / 2 + 3, { steps: 8 });
  await p.waitForTimeout(800);
  const hov = await p.evaluate(() => { const o = document.querySelector('.build:nth-child(2) .obj'), r = o.getBoundingClientRect(); return { on: o.classList.contains('on'), others: document.querySelectorAll('.obj.on').length, inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, opacity: +getComputedStyle(o.firstElementChild).opacity }; });
  check('hovering a build reveals its object at the cursor', hov.on && hov.others === 1 && hov.inView && hov.opacity > 0.9, JSON.stringify(hov));
  await shot(p, 'd-work-hover');
  await p.mouse.move(10, 300); await p.waitForTimeout(500);
  check('object hides when the cursor leaves', await p.evaluate(() => document.querySelectorAll('.obj.on').length) === 0);
  await p.focus('.build:nth-child(4) .build-row'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(600);
  check('keyboard focus reveals the object too', await p.evaluate(() => document.querySelector('.build:nth-child(4) .obj').classList.contains('on')));
  await shot(p, 'd-work-focus');

  // Globe
  await p.evaluate(() => document.getElementById('globe').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(900);
  await shot(p, 'd-globe');
  const front = await p.evaluate(() => { const g = document.getElementById('globe').getBoundingClientRect(); const t = [...document.querySelectorAll('.tile:not(.back)')].map(el => ({ el, r: el.getBoundingClientRect() })).sort((a, b) => Math.hypot(a.r.x + a.r.width / 2 - g.x - g.width / 2, a.r.y + a.r.height / 2 - g.y - g.height / 2) - Math.hypot(b.r.x + b.r.width / 2 - g.x - g.width / 2, b.r.y + b.r.height / 2 - g.y - g.height / 2))[0]; t.el.id = 'front-tile'; return t.el.textContent.trim(); });
  await clickMoving(p, '#front-tile');
  check('tapping a tile picks it', (await p.getAttribute('#front-tile', 'aria-pressed')) === 'true' && (await p.textContent('#pick-count')).includes(front), await p.textContent('#pick-count'));
  const before = await p.evaluate(() => document.querySelector('.tile').style.transform);
  const g = await (await p.$('#globe')).boundingBox();
  await p.mouse.move(g.x + g.width * 0.5, g.y + g.height * 0.1); await p.mouse.down(); await p.mouse.move(g.x + g.width * 0.8, g.y + g.height * 0.12, { steps: 8 }); await p.mouse.up();
  check('dragging spins the globe', before !== await p.evaluate(() => document.querySelector('.tile').style.transform));
  await p.focus('.tile[tabindex="0"]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(900);
  const kb = await p.evaluate(() => { const a = document.activeElement, g = document.getElementById('globe').getBoundingClientRect(), r = a.getBoundingClientRect(); return { tile: a.classList.contains('tile'), stops: document.querySelectorAll('.tile[tabindex="0"]').length, centered: Math.hypot(r.x + r.width / 2 - g.x - g.width / 2, r.y + r.height / 2 - g.y - g.height / 2) < 90, back: a.classList.contains('back') }; });
  check('arrow keys move through the globe and turn the task to the front', kb.tile && kb.stops === 1 && kb.centered && !kb.back, JSON.stringify(kb));
  await p.keyboard.press('Space');
  check('space picks the focused task', await p.evaluate(() => document.activeElement.getAttribute('aria-pressed')) === 'true');
  await p.click('#pick-carry'); await p.waitForTimeout(900);
  check('picked tasks carry into the form', (await p.inputValue('#f-msg')).includes('We would love to hand off: ' + front));

  // FAQ
  await jump(p, '#faq'); await p.click('#faq summary');
  check('faq opens', await p.evaluate(() => document.querySelector('#faq details').open));
  await shot(p, 'd-faq');

  // Form
  await jump(p, '#contact'); await p.waitForTimeout(900);
  await p.click('#lead-form button[type=submit]');
  check('empty form shows an inline error and focuses it', await p.isVisible('#e-name') && await p.evaluate(() => document.activeElement.id) === 'f-name');
  await p.fill('#f-name', 'Maya Okafor'); await p.fill('#f-email', 'maya@northfield.co');
  await p.click('#lead-form button[type=submit]');
  check('consent box is required and not pre-ticked', await p.isVisible('#e-agree') && await p.isHidden('#success'));
  await shot(p, 'd-form-errors');
  await p.check('#f-agree');
  await p.click('#lead-form button[type=submit]');
  const mail = await p.getAttribute('#mail-link', 'href');
  check('valid form hands off to email', await p.isVisible('#success') && await p.isHidden('#lead-form') && mail.startsWith('mailto:jerrydfang@gmail.com?subject=') && decodeURIComponent(mail).includes('Name: Maya Okafor') && decodeURIComponent(mail).includes('I am 18 or older'));
  await shot(p, 'd-form-success');
  await p.click('#again');
  check('form resets', await p.isVisible('#lead-form') && (await p.inputValue('#f-name')) === '' && !(await p.isChecked('#f-agree')));

  // Theme
  await p.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await p.check('.theme-switch input[value=dark]', { force: true });
  check('dark theme applies', await p.evaluate(() => document.documentElement.dataset.mode) === 'night');
  await p.reload({ waitUntil: 'networkidle' });
  check('theme choice is remembered', await p.evaluate(() => document.documentElement.dataset.mode) === 'night');
  await shot(p, 'n-hero');
  await jump(p, '.world-body'); await p.waitForTimeout(1200); await shot(p, 'n-bento');
  await p.evaluate(() => localStorage.removeItem('df-theme'));
  await p.context().close();
}

// ---------- 2. Deep links from the legal pages ----------
{
  const p = await open('topic', DESK, { path: 'index.html?topic=delete#contact' });
  const t = await p.evaluate(() => ({ v: document.getElementById('f-topic').value, label: document.getElementById('l-msg').textContent, btn: document.getElementById('submit-label').textContent }));
  check('"Delete my data" link preselects the request', t.v === 'delete' && t.btn === 'Send request', JSON.stringify(t));
  await p.context().close();
}

// ---------- 3. Privacy choice banner ----------
{
  const p = await open('consent', DESK, { consent: false });
  check('banner shows on a first visit', await p.isVisible('#consent'));
  await shot(p, 'x-consent');
  const sizes = await p.evaluate(() => [...document.querySelectorAll('#consent .pill')].map(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b); return [Math.round(r.width), Math.round(r.height), s.backgroundColor, s.color, s.fontWeight].join('|'); }));
  check('both choices look the same (no dark pattern)', sizes[0] === sizes[1], sizes.join('  vs  '));
  await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
  check('banner is reachable by keyboard right after the skip link', await p.evaluate(() => document.activeElement.closest('#consent') !== null));
  check('nothing is stored before a choice', await p.evaluate(() => localStorage.getItem('df-consent')) === null && (await p.context().cookies()).length === 0);
  await p.click('[data-consent="essential"]');
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('df-consent')));
  check('"Essential only" is saved and analytics stay off', await p.isHidden('#consent') && saved.analytics === false && await p.evaluate(() => window.DF.consent.analytics) === false);
  await p.reload({ waitUntil: 'networkidle' });
  check('banner stays away after choosing', await p.isHidden('#consent'));
  await p.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await p.click('footer [data-open-consent]');
  check('"Privacy choices" reopens it', await p.isVisible('#consent') && await p.evaluate(() => document.activeElement.closest('#consent') !== null));
  await p.evaluate(() => { window.__heard = null; window.DF.onConsent(c => { window.__heard = c.analytics; }); });
  await p.click('[data-consent="all"]');
  check('opting in is recorded and announced to listeners', await p.evaluate(() => window.__heard) === true && await p.evaluate(() => JSON.parse(localStorage.getItem('df-consent')).analytics) === true);
  check('still no cookies', (await p.context().cookies()).length === 0);
  await p.context().close();
}

// ---------- 4. Legal pages, links, 404 ----------
{
  const links = new Set();
  for (const [file, h1] of [['privacy', 'Privacy policy'], ['terms', 'Terms of service'], ['refunds', 'Refund policy'], ['cookies', 'Cookie policy'], ['licenses', 'Licenses and credits'], ['404', 'This page slipped through.']]) {
    const p = await open(file, DESK, { path: file + '.html' });
    const info = await p.evaluate(() => ({ h1: document.querySelector('h1').textContent, email: document.body.textContent.includes('jerrydfang@gmail.com'), foot: !!document.querySelector('footer address'), links: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')) }));
    check(`${file}.html renders`, info.h1 === h1 && info.email && info.foot, JSON.stringify({ h1: info.h1 }));
    info.links.forEach(h => { if (!/^(https?:|mailto:|#)/.test(h)) links.add(h.split('#')[0].split('?')[0]); });
    await shot(p, 'x-' + file);
    await p.setViewportSize({ width: 390, height: 760 }); await p.waitForTimeout(300);
    check(`${file}.html fits a phone`, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) === 0);
    await p.context().close();
  }
  const home = await open('links', DESK);
  (await home.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')))).forEach(h => { if (!/^(https?:|mailto:|#)/.test(h)) links.add(h.split('#')[0].split('?')[0]); });
  ['assets/licenses/OFL-Geist.txt', 'assets/favicon.svg', 'assets/og.png', 'assets/apple-touch-icon.png'].forEach(l => links.add(l));
  const dead = [];
  for (const l of links) { const r = await home.request.get(BASE + l); if (r.status() !== 200) dead.push(`${l} ${r.status()}`); }
  check(`all ${links.size} internal links resolve`, dead.length === 0, dead.join(', '));
  const ids = await home.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.querySelector(h)));
  check('every in-page anchor has a target', ids.length === 0, ids.join(', '));
  const del = await open('delete', DESK, { path: 'privacy.html' });
  await del.click('a[data-topic="delete"]'); await del.waitForLoadState('networkidle');
  check('privacy page button leads to the delete request form', del.url().includes('topic=delete') && await del.evaluate(() => document.getElementById('f-topic').value) === 'delete');
  await del.context().close(); await home.context().close();
}

// ---------- 5. Phone ----------
{
  const p = await open('phone', PHONE);
  await p.waitForTimeout(5600);
  const m = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, hero: document.querySelector('.hero').classList.contains('scrub'), portal: document.getElementById('services').classList.contains('scrub-portal'), inside: document.getElementById('inside').classList.contains('scrub'), status: document.getElementById('status-text').textContent }));
  check('phone: no sideways scroll, hero plays on its own, portal and stack still scrub', m.overflow === 0 && !m.hero && m.portal && m.inside && m.status === 'Live', JSON.stringify(m));
  await shot(p, 'm-hero');
  await p.click('#burger'); await p.waitForTimeout(800);
  check('phone menu opens and holds focus', await p.evaluate(() => document.body.classList.contains('menu-open') && document.getElementById('main').inert === true));
  await shot(p, 'm-menu');
  await p.click('#burger'); await p.waitForTimeout(600);
  await scrub(p, '#portal', '.portal-stage', 0); await p.waitForTimeout(4200); await shot(p, 'm-portal-0');
  const hole = await (await p.$('#porthole')).boundingBox();
  const client = await p.context().newCDPSession(p);
  for (let i = 0; i < 9; i++) {
    const y = hole.y + hole.height * (0.14 + i * 0.09);
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: hole.x + hole.width * 0.12, y }] });
    for (let s = 1; s <= 8; s++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: hole.x + hole.width * (0.12 + 0.76 * s / 8), y }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  await p.waitForTimeout(400);
  check('phone: wiping with a finger clears the fog', await p.evaluate(() => document.getElementById('porthole').classList.contains('clear')));
  await scrub(p, '#portal', '.portal-stage', 1); await shot(p, 'm-portal-100');
  await jump(p, '.world-body'); await p.waitForTimeout(1200); await shot(p, 'm-bento');
  await scrub(p, '#inside', '.inside-stage', 0.55); await shot(p, 'm-inside-55');
  const fit = await p.evaluate(() => { const s = document.getElementById('stack').getBoundingClientRect(); return { left: Math.round(s.left), right: Math.round(s.right), w: innerWidth }; });
  check('phone: the 3D stack stays on screen', fit.left >= -4 && fit.right <= fit.w + 4, JSON.stringify(fit));
  for (const id of ['estimate', 'promises', 'work', 'faq', 'contact']) { await jump(p, '#' + id); await p.waitForTimeout(1100); await shot(p, 'm-' + id); }
  await jump(p, '.build:nth-child(2)'); await p.waitForTimeout(900);
  check('phone: build objects appear in place as you scroll', await p.evaluate(() => { const o = document.querySelector('.build:nth-child(2) .obj'); return o.classList.contains('on') && getComputedStyle(o).position === 'static'; }));
  await p.evaluate(() => document.getElementById('globe').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(900); await shot(p, 'm-globe');
  const tiles = await p.evaluate(() => { const t = [...document.querySelectorAll('.tile')].filter(x => !x.hidden); const f = t.filter(x => !x.classList.contains('back')).sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0]; f.id = 'front-tile'; return t.length; });
  { const c = await center(p, '#front-tile'); await p.touchscreen.tap(c.x, c.y); }
  check('phone: smaller globe, tap picks a task', tiles === 16 && (await p.getAttribute('#front-tile', 'aria-pressed')) === 'true', 'tiles ' + tiles);
  check('phone: still no sideways scroll at the end', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) === 0);
  await p.context().close();
}

// ---------- 6. Reduced motion ----------
{
  const p = await open('reduced', { ...DESK, reducedMotion: 'reduce' });
  const r = await p.evaluate(() => ({ hero: document.querySelector('.hero').classList.contains('scrub'), portal: document.getElementById('services').classList.contains('scrub-portal'), inside: document.getElementById('inside').classList.contains('scrub'), status: document.getElementById('status-text').textContent, fog: getComputedStyle(document.getElementById('porthole')).display, head: +getComputedStyle(document.getElementById('world-head')).opacity, caps: [...document.querySelectorAll('.cap:not(.extra)')].every(c => +getComputedStyle(c).opacity === 1), words: document.querySelectorAll('#premise-text .w:not(.lit)').length }));
  check('reduced motion: nothing pins or scrubs, everything is readable at rest', !r.hero && !r.portal && !r.inside && r.status === 'Live' && r.fog === 'none' && r.head === 1 && r.caps && r.words === 0, JSON.stringify(r));
  await shot(p, 'r-hero');
  await jump(p, '#services'); await p.waitForTimeout(500); await shot(p, 'r-services');
  await jump(p, '#inside'); await p.waitForTimeout(500); await shot(p, 'r-inside');
  await p.evaluate(() => document.getElementById('globe').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(500);
  const a = await p.evaluate(() => document.querySelector('.tile').style.transform); await p.waitForTimeout(700);
  check('reduced motion: the globe does not spin by itself', a === await p.evaluate(() => document.querySelector('.tile').style.transform));
  await shot(p, 'r-globe');
  await p.context().close();
}

// ---------- 7. Keyboard ----------
{
  const p = await open('keyboard', DESK);
  const seen = [];
  for (let i = 0; i < 9; i++) {
    await p.keyboard.press('Tab'); await p.waitForTimeout(i ? 60 : 450);
    seen.push(await p.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(), s = getComputedStyle(a); return { what: (a.textContent || a.getAttribute('aria-label') || a.tagName).trim().slice(0, 22), visible: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight, ring: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 }; }));
  }
  check('keyboard: skip link first, every stop visible with a focus ring', seen[0].what === 'Skip to content' && seen.every(s => s.visible && s.ring), JSON.stringify(seen.filter(s => !s.visible || !s.ring)));
  await p.context().close();
}

await browser.close();
check('no requests leave the site (no third-party scripts, fonts or trackers)', outside.size === 0, [...outside].join(', '));
check('no console errors', errors.length === 0, errors.join(' | '));
console.log(`\n${passed} passed, ${fails.length} failed`);
if (fails.length) { console.log(fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
