# Double Fang website

One-page site for Double Fang, an AI studio for business models, websites and automations. Plain HTML, CSS and JavaScript. No build step.

## Run it
```bash
python3 -m http.server 8765 -d site   # then open http://localhost:8765
```
Opening `site/index.html` by double-click also works.

## What's where
- `site/` is the whole website. Deploy the contents of this folder.
  - `index.html`, `404.html`
  - `assets/css/main.css`, `assets/js/main.js`
  - `assets/fonts/` self-hosted Bricolage Grotesque, Geist, Geist Mono (latin woff2)
  - `assets/og.png`, `assets/apple-touch-icon.png`, `assets/favicon.svg`
- `design/` is never deployed.
  - `design-package.md`: every design decision and all copy
  - `image-briefs.md`: images to generate once an image platform is connected
  - `tests/selftest.mjs`: Playwright self-test (hero bands, flows, phone, reduced motion, console errors)
  - `tools/icons.mjs`: re-renders the share image and touch icon

## Test
```bash
python3 -m http.server 8765 -d site &
node design/tests/selftest.mjs      # screenshots land in design/tests/shots/
```

## Honest notes
- **The form is not connected.** Submitting shows a success state that says nothing was sent. Before launch, point it at a form service (Formspree or similar) or a real inbox.
- **Claims to confirm:** "3 weeks from first call to launch", "two to four weeks" in the FAQ, and the four house rules are proposed policy. Change them if they are not true for you.
- **og:image is a relative path.** Swap in the absolute URL at deploy.
- The hero, services and example cards use real UI built in HTML plus the logo. No photography yet.
