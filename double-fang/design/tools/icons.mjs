// Renders site/assets/og.png (1200x630) and site/assets/apple-touch-icon.png (180x180).
//   PW=$(npm root -g)/playwright node design/tools/icons.mjs
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PW || 'playwright');
const mark = (size, fang) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}"><rect x="8" y="4" width="84" height="9" rx="4.5" fill="#fa2406"/><path d="M16 20H45C45 47 42 70 37 94C30 70 20 48 16 20Z" fill="${fang}"/><path d="M55 20H84C80 48 70 70 63 94C58 70 55 47 55 20Z" fill="${fang}"/></svg>`;
const font = new URL('../../site/assets/fonts/bricolage-grotesque.woff2', import.meta.url).href;
const cloud = (x, y, w) => `<i style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w * 0.42}px;border-radius:50%;background:radial-gradient(closest-side,#fdfdfe 30%,rgba(253,253,254,0))"></i>`;
const b = await chromium.launch();
const p = await b.newPage();
await p.setViewportSize({ width: 1200, height: 630 });
await p.setContent(`<style>@font-face{font-family:B;src:url(${font})}
body{margin:0;width:1200px;height:630px;background:#0099ff;position:relative;overflow:hidden;font-family:B;color:#071a2b}
.card{position:absolute;left:90px;top:105px;width:1020px;height:420px;border-radius:48px;background:#fdfdfe;box-shadow:0 60px 90px -50px rgba(0,40,84,.7);display:flex;align-items:center;gap:44px;padding:0 76px;box-sizing:border-box}
h1{font-size:88px;letter-spacing:-.045em;line-height:1;margin:0;font-weight:600}em{font-style:normal;color:#fa2406}</style>
${cloud(-120, 20, 520)}${cloud(820, 430, 560)}${cloud(700, -60, 380)}
<div class="card">${mark(150, '#071a2b')}<h1>AI that actually does the <em>work.</em></h1></div>`);
await p.waitForTimeout(400);
await p.screenshot({ path: 'site/assets/og.png' });
await p.setViewportSize({ width: 180, height: 180 });
await p.setContent(`<body style="margin:0;width:180px;height:180px;background:#0099ff;display:grid;place-items:center">${mark(120, '#fdfdfe')}</body>`);
await p.screenshot({ path: 'site/assets/apple-touch-icon.png' });
await b.close();
console.log('icons rendered');
