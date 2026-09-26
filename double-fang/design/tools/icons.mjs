// Renders og.png (1200x630) and apple-touch-icon.png (180x180): node design/tools/icons.mjs
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PW || 'playwright');
const mark = `<svg viewBox="0 0 100 100" width="W" height="W"><rect x="8" y="4" width="84" height="9" rx="4.5" fill="#ff5b37"/><path d="M16 20H45C45 47 42 70 37 94C30 70 20 48 16 20Z" fill="#ecebe6"/><path d="M55 20H84C80 48 70 70 63 94C58 70 55 47 55 20Z" fill="#ecebe6"/></svg>`;
const font = new URL('../../site/assets/fonts/bricolage-grotesque.woff2', import.meta.url).href;
const b = await chromium.launch(); const p = await b.newPage();
await p.setViewportSize({ width: 1200, height: 630 });
await p.setContent(`<style>@font-face{font-family:B;src:url(${font})}body{margin:0;width:1200px;height:630px;background:radial-gradient(700px 500px at 90% 0,rgba(255,91,55,.16),transparent 60%),#0b0c0e;display:flex;align-items:center;gap:40px;padding:0 110px;box-sizing:border-box;font-family:B;color:#ecebe6}h1{font-size:92px;letter-spacing:-.045em;line-height:1;margin:0;font-weight:600}em{font-style:normal;color:#ff5b37}</style>${mark.replace(/W/g,'150')}<h1>AI that actually does the <em>work.</em></h1>`);
await p.waitForTimeout(400);
await p.screenshot({ path: 'site/assets/og.png' });
await p.setViewportSize({ width: 180, height: 180 });
await p.setContent(`<body style="margin:0;width:180px;height:180px;background:#0b0c0e;display:grid;place-items:center">${mark.replace(/W/g,'120')}</body>`);
await p.screenshot({ path: 'site/assets/apple-touch-icon.png' });
await b.close();
