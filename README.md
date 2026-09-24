# claude
testing the capabilities of opus 5.5

## Wok Express

A one-page website for Wok Express, a Chinese takeout concept brand. Scrolling the hero plays a 3D film of a takeout box opening, forward and backward with the scroll. Below it, the menu and the order builder feed one live ticket.

### Run it

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

Double-clicking `site/index.html` also works. Browsers block `fetch` on `file://`, so that view shows the designed still hero instead of the scrolling film.

### What's where

| Path | What it is |
|---|---|
| `site/` | The website. Deploy this folder as-is: plain HTML, CSS and JS, no build step. |
| `site/index.html` | The page. Copy comes from the design package. |
| `site/assets/css/main.css` | Tokens for light and dark themes, plus every section. |
| `site/assets/js/main.js` | Scroll-scrub film engine, ordering, nav, reveals, theme switch. |
| `site/assets/video/` | Hero film in H.264 MP4 and VP9 WebM, at 1080p and 720p. |
| `site/404.html` | Branded not-found page. |
| `design/design-package.md` | Every design decision and all copy, plus the comp analysis. |
| `design/brand/` | Logo mark, character seal, brand board (`brand-board.png`). |
| `design/comps/web/` | One reference image per page section, with the HTML that renders them. |
| `design/comps/mobile/` | Three app screens in a phone frame. |
| `design/render/` | The Three.js scene and the script that renders the film frames and stills. |
| `design/tests/selftest.mjs` | Playwright self-test: scrub, ordering, phone, dark, reduced motion, film failure. |

### Rebuild the film

```bash
cd design/render && npm install
cd ../.. && python3 -m http.server 8765 &
cd design/render && node render.mjs film 180 1920 1080 && node render.mjs stills 2400 1600
```

Then encode the frames with ffmpeg: short keyframe interval, no audio (commands in `design/design-package.md`, section 5).

### Honest notes

- Every image is a 3D render made in code. The footer says so.
- The order form is a demo. It validates and shows a success state but sends nothing. Before real orders, point it at an ordering system or a form service.
- `og:image` is a relative path. Change it to the full live URL when the site is deployed.
