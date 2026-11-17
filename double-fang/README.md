# Double Fang website

The website for Double Fang, an AI studio for business models, websites and automations. One home page plus five legal pages. Plain HTML, CSS and JavaScript. No build step, no trackers, and nothing is loaded from other sites.

Colors: sky blue `#0099FF` and cloud white `#FDFDFE` do the quiet work. Amber red `#FA2406` is the one loud color.

## Run it
```bash
python3 -m http.server 8765 -d site   # then open http://localhost:8765
```
Opening `site/index.html` by double-click also works.

## What's where
- `site/` is the whole website. Deploy the contents of this folder.
  - `index.html`: the home page
  - `privacy.html`, `terms.html`, `refunds.html`, `cookies.html`, `licenses.html`, `404.html`: built by a script, so do not edit them by hand (see below)
  - `assets/css/main.css`: every style, both themes
  - `assets/js/site.js`: theme switch and privacy choice, used by every page
  - `assets/js/main.js`: the home page animations and the contact form
  - `assets/fonts/`: Bricolage Grotesque, Geist and Geist Mono, served from the site itself
  - `assets/licenses/`: the full license text for the fonts and icons
  - `assets/og.png`, `assets/apple-touch-icon.png`, `assets/favicon.svg`
- `design/` is never deployed.
  - `design-package.md`: every design decision and all home page copy
  - `legal-checklist.md`: the 25 legal items, where each one lives, and what is left for you
  - `image-briefs.md`: images worth making later
  - `legal/`: the plain source text of the legal pages
  - `tools/`: small scripts (below)
  - `tests/`: the checks (below)

## Change the legal pages or the business details
1. Edit the text in `design/legal/*.html`.
2. Email, place and "last updated" date live in `SITE` at the top of `design/tools/pages.py`.
3. Run `python3 design/tools/pages.py`. It rebuilds the six pages in `site/` and copies the privacy banner and footer from the home page, so every page stays in step.

The home page shows the email address in three spots (the footer and the form's sent card). Search `site/index.html` for the address to change them.

## Tools
```bash
python3 design/tools/pages.py                      # rebuild the legal pages and the 404 page
python3 design/tools/sprite.py <phosphor light dir> # rebuild the icon sprite (npm i @phosphor-icons/core)
node design/tools/icons.mjs                        # redraw the share image and touch icon
node design/tools/serve.mjs 8766                   # preview server with compression, for honest speed tests
python3 design/tools/bundle.py out.html            # one-file preview with everything inlined
```

## Test
```bash
python3 -m http.server 8765 -d site &
node design/tests/selftest.mjs      # 71 checks on desktop and phone, screenshots land in design/tests/shots/
python3 design/tests/contrast.py    # color contrast math for both themes
python3 design/tests/copygate.py    # copy rules: no dashes, no stock words
```
The self-test covers every animation, the form, the privacy banner, the legal pages, keyboard use, reduced motion, and it fails if the page calls any other website.

Last run: 71 of 71 checks passed, 0 contrast failures, 0 copy gate hits. Lighthouse with the compressed server: 99 / 100 / 100 / 100 on mobile and 100 / 100 / 100 / 100 on desktop (performance, accessibility, best practices, SEO).

## Honest notes
- **The form uses the visitor's own email app.** Pressing the button opens a ready-to-send email to the studio address. The site itself sends nothing and stores nothing. If you want notes to arrive without that extra tap, connect a form service, then name it in the privacy policy.
- **The legal pages are plain-language drafts, not legal advice.** They were written for a small studio in Ontario, Canada. Have a lawyer read them before you rely on them.
- **The privacy banner asks about analytics that do not exist yet.** It says so in its own words. Today both answers give the same site. The switch is ready if analytics are ever added.
- **Promises to confirm** are listed in `design/legal-checklist.md`. Change the site if any of them is not true for you.
- **og:image is a relative path.** Swap in the full web address at deploy.
- **No photography.** Every picture is the logo or real interface drawn in code. The businesses in the examples are made up and labelled that way.
- **Light is the default look.** A dark version is in the footer switch.
