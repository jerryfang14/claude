---
name: double-fang-website-skill
description: The Double Fang Website Skill, a complete step-by-step process for designing, building, testing and shipping a premium one-page website for any business, brand, product or idea (restaurants, takeout, shops, studios, SaaS, services, portfolios). It combines the rules of 10k-websites, design-taste-frontend, high-end-visual-design, minimalist-ui, industrial-brutalist-ui, full-output-enforcement and redesign-existing-projects into one ordered workflow with the conflicts between them already resolved. Use it whenever the user asks to build, make, design, redesign or rebuild a website, landing page, homepage, one-page site, scroll site or brand site, even if they do not name this skill, and use it instead of loading those individual skills separately. Also use it when the user says Double Fang, Double Fang website, or asks to do it like the Wok Express site.
---

# Double Fang Website Skill

This skill turns a one-line request ("make a website for my takeout brand") into a finished, tested, shipped one-page website that looks like it cost thousands of dollars. It is the exact process used to build the Wok Express site, written down so it runs the same way every time.

It combines seven skills into one workflow. Each one has a job:

| Folded-in skill | What it contributes here |
|---|---|
| 10k-websites | The backbone: phases, question moments, customer research, the design package, the scroll-scrubbed hero engine, the copy gate, the self-test, honest forms |
| design-taste-frontend | The design read, the three dials, the anti-slop rules and the final pre-flight matrix |
| high-end-visual-design | Floating island nav, double-bezel media shells, button-in-button CTAs, custom easing, blur-up entrances |
| minimalist-ui | Text colors, hairline system, muted pastel tags, the boxless FAQ, restraint |
| industrial-brutalist-ui | A full archetype when the brief is raw or technical; otherwise an accent layer (hairline grids, mono tickets, oversized numerals) |
| full-output-enforcement | Every file complete; no skipped sections, no "rest of code", no TODOs |
| redesign-existing-projects | The audit pass on your own v1 before shipping, and the playbook when the user brings an existing site |

**Left out on purpose:** the image generation skills (brandkit, imagegen-frontend-web, imagegen-frontend-mobile, image-to-code). The user found code-rendered imagery (Three.js product renders, HTML-screenshot comps) far below the bar. Media is handled by Phase 6, which stays off until the user connects a real image or video generation platform and tells you so.

Read this whole file before replying to the user. The first message you send is the Phase 0 checklist.

---

## Ground rules

- **The user is the taste. You are the designer, director and engineer.** Propose, let them choose, handle every technical detail yourself, explain only what helps them choose.
- **Precedence:** the user's own words first, then an existing design system in their project (tokens, CLAUDE.md, theme files), then this skill.
- **The pipeline is fixed; the website is where creativity lives.** Same phases, same order, same gates every run. Inside a phase, invent freely and say out loud when you deviate from a default.
- **Say what things cost before spending the user's money.** Credits, paid APIs, domains: preflight the price, state it, get a yes.
- **Never ship fake photography.** No code-drawn 3D "product shots", no SVG food illustrations standing in for photos, no div-based fake screenshots. Real photos, user assets, or a generator the user has connected. Brand marks, icons and real UI built in HTML are fine.
- **Complete output only (full-output-enforcement).** Every file finished. Banned in shipped code: `// ...`, `// rest of code`, `// TODO`, "similar to above", skeletons in place of implementations. If a response would run out of room, stop at a clean file boundary and end with `[PAUSED: X of Y complete. Send "continue" to resume from: <next file or section>]`, then resume exactly there with no recap.
- **Every GATE is a hard stop.** Never skip one.

## Where the folded-in skills disagree, and who wins

These clashes were settled during the Wok Express build. Apply the ruling; don't re-litigate it mid-build.

| Clash | Ruling |
|---|---|
| Stack: taste defaults to React/Next/Tailwind; 10k demands plain HTML/CSS/JS in one folder | 10k for brand and marketing sites. React only if the user asks for an app or the project already uses it |
| Fonts: minimalist wants serif headings; brutalist lists Inter; high-end bans Inter/Roboto/Helvetica; taste discourages serif | Characterful sans display, no banned faces. Serif only with a stated heritage or editorial reason |
| Radius: high-end squircles + pill buttons; minimalist 4-8px, no pill buttons; brutalist zero radius | The three-tier shape rule in Phase 4 |
| Lead aesthetic: minimalist warm monochrome vs brutalist Swiss/terminal vs high-end glass | The user's feeling picks one lead (Phase 3 table); the others contribute accents only |
| Eyebrows: high-end puts a pill label above every major heading; taste caps them | Taste's cap: one per three sections |
| All caps: brutalist uppercases everything; redesign flags all-caps subheads | Uppercase only on eyebrows and data surfaces (tickets, specs, tags) |
| Missing imagery: taste allows picsum placeholders; this skill bans fake photography | Designed image slots with written briefs (Phase 6). Random stock filler never ships |
| FAQ: minimalist uses an accordion; redesign suggests alternatives | Boxless accordion with hairlines and a +/- toggle |
| Entrances: high-end starts elements invisible; the artifact viewer wants content readable at rest | Invisible start is fine on the real site behind a `js` class; preview bundles start visible |
| Section spacing: high-end py-24 to py-40; minimalist py-24 to py-32 | `clamp(96px, 11vw, 168px)` |

---

## How to talk to the user

Most people using this are not developers. Talk like a friendly expert who respects their time.

- Plain words, short sentences. Explain an unavoidable technical term in the same breath.
- **Ask with clickable choices** (the AskUserQuestion tool) whenever the answer can be a pick. Up to 4 questions per round, recommended option first and marked "(Recommended)", one plain line per option. "Other" is added automatically, so free text is never blocked. If the tool is missing, ask in one short message.
- Typed answers only where typing is the honest answer: their idea in their own words, their feedback, a pasted command.
- No em dashes anywhere you write, in chat or in site copy. Use commas and periods.
- No "Great question!", no "I hope this helps", no "Let's dive in". Just say the thing.
- When work will take minutes (a render, a long install, a deploy), say so in one line when it starts, so the quiet reads as work.
- When something breaks, say what happened and what you're doing about it in one sentence, then fix it.
- Describe work in human terms ("the captions now fade in as the lid opens"), not code terms.

---

## Phase 0: Scan the machine (first message)

Check everything yourself before asking anything, then report a short ✓/✗ checklist:

- Node.js (`node --version`) and Python 3.
- A headless browser for testing and screenshots (Playwright + Chromium). In cloud sessions it is often preinstalled; never re-download browsers if one exists.
- `ffmpeg`, only needed if a hero video will be encoded. If missing, `pip install imageio-ffmpeg` gives a static binary without system installs.
- Network reach for Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) and the npm registry. Note anything blocked by policy; plan around it rather than fighting it.
- **Media platform:** is an image/video generation tool connected (Higgsfield or another)? If yes, check the balance and whether free-trial allowances exist. If no, note "media: off until you connect a platform". Do not suggest alternatives the user didn't ask for.

Install the automatic things yourself after one ask. Verify each by running it.

---

## Phase 1: The brief (one clickable round)

Ask these together in one AskUserQuestion call, shaped to what they already told you:

1. **Name.** "Name it for me (Recommended)" / "Working name for now". Other lets them type the real one.
2. **What we're working with.** New brand, generate everything (footer discloses it's a concept) / Real business, no usable photos (ask later if the site should disclose generated imagery) / Real business with photos or a logo (they attach them next) / Software product with screenshots (screenshots ship as-is in sections).
3. **Feeling.** Four options built from their niche, each with one line of what it looks like. Typical set: bold print / late-night neon / calm modern premium / playful and loud.
4. **Media plan.** Use my photos and logo / Use the connected generator, with a budget line (only if one is connected) / No imagery yet, build with image slots.

Read the answers literally. If an answer is ambiguous and one reading spends money, take the reading that doesn't spend and say how to switch.

---

## Phase 2: Research the buyers

Before designing anything, find the exact words real customers use. Search reviews and forum threads in the niche (a handful of sources is enough). Collect verbatim:

- **Pains** (for takeout: "soggy", "greasy", "cold by the time it got here", "wrong order", "waited over an hour").
- **Wants** ("ready when I walked in", "still hot when I got home", "made to order").
- **Objections** (delivery? allergies? how long?).

If web access is blocked, ask the user to paste a few reviews. Keep the source list; it goes in the design package.

Use the findings three ways: write copy in the buyers' own words, structure the page to funnel to ONE call to action, and answer every real objection somewhere (proof, steps, FAQ).

---

## Phase 3: Design read, dials, direction

**The design read (one line, stated to the user):**
> Reading this as: [page kind] for [audience], with a [vibe] language, leaning toward [stack + signature].

Example: "Reading this as: a premium-consumer landing page for a new takeout brand, for hungry locals who pick up after work, with a calm modern premium language, leaning toward native CSS + vanilla JS, a scroll-scrubbed hero, and restrained editorial motion."

**Set the three dials** (all layout, motion and density decisions are gated by these):

| Brief | DESIGN_VARIANCE | MOTION_INTENSITY | VISUAL_DENSITY |
|---|---|---|---|
| Minimalist / calm / editorial | 5-6 | 3-4 | 2-3 |
| Premium consumer / luxury / brand | 7-8 | 5-7 | 3-4 |
| Playful / agency / experimental | 9-10 | 8-10 | 3-4 |
| Landing page default | 7-9 | 6-8 | 3-5 |
| Trust-first / public sector | 3-4 | 2-3 | 4-5 |

**Pick the lead archetype from the user's feeling, then take accents from the others.** Never blend two archetypes at full strength.

| Feeling | Lead | Accents allowed from the others |
|---|---|---|
| Calm, modern, premium, clean | minimalist-ui restraint + high-end "Soft Structuralism" | brutalist: hairline `gap: 1px` grids, one mono data surface (ticket, spec, receipt), one oversized numeral |
| Bold print, raw, technical, archival | industrial-brutalist "Swiss Industrial Print" (light) or "Tactical Telemetry" (dark) | high-end motion and button physics; minimalist FAQ |
| Luxury, cinematic, atmospheric | high-end "Editorial Luxury" or "Ethereal Glass", giant hero | minimalist typography colors; brutalist none or one numeral |
| Playful, loud, social | high variance, expressive display type | minimalist tags; no brutalist |

**Propose 2 or 3 hero concepts (GATE: user picks one).** One plain sentence each: what the visitor sees as they scroll, and the final resting frame. Recommend one. Add one honest line: phones see a designed still, the scroll film plays on laptops and desktops. If Phase 6 media is off, concepts are still or typographic heroes built to accept a film later, and say so.

---

## Phase 4: The brand system

### Palette
- 4 to 6 named hex values pulled from the subject's own world. One accent only, saturation under 80%, used everywhere it appears (Color Consistency Lock).
- One gray family, one temperature. Tint every neutral toward the palette; never mix warm paper with cool gray text.
- No pure `#000` or `#FFF`. Off-black and off-white.
- **Banned as defaults** (use only if the user names them or the brand is genuinely vintage craft): cream `#F5F1EA #F7F5F1 #FBF8F1 #EFEAE0 #ECE6DB #FAF7F1 #E8DFCB`; brass/clay/oxblood `#B08947 #B6553A #9A2436 #9C6E2A #BC7C3A #7D5621`; espresso text `#1A1714 #1A1814 #1B1814`. Also banned: purple-to-blue AI gradients, neon glows.
- Define light AND dark themes from the start (tokens below). Check every text/background pair with real contrast math: 4.5:1 body, 3:1 large text and UI boundaries (input borders count).

### Type trio
- **Display + body:** a characterful sans from Google Fonts, used with deliberate width and tracking. Worked example: Archivo variable (width 62 to 125) set at `font-stretch: 112%`, weight 560, tracking `-0.035em` to `-0.045em` for headlines.
- **Mono:** for prices, times, data (JetBrains Mono, Geist Mono, IBM Plex Mono).
- **Banned faces:** Inter, Roboto, Arial, Open Sans, Helvetica (high-end), plus Fraunces and Instrument Serif as display (taste).
- **Serif only with a reason:** a heritage or cultural script (for example Chinese characters in Noto Serif TC as texture and seal), or an editorial/luxury brief you can justify in one sentence. Emphasis inside a headline uses italic or bold of the same family, never a random serif word.
- Self-host fonts as woff2 (see Phase 7). Subset large scripts: the Google Fonts CSS2 `text=` parameter returns a tiny file with only the characters you pass.

### The mark
Taste rule: an invented brand gets a real SVG mark, never a plain text wordmark. Method:
1. Derive meaning first: category, audience, promise, one core metaphor (Wok Express: a seal = a stamped promise, holding the wok's breath = steam).
2. Pick one concept method, two at most: monogram + meaning, product action, metaphor fusion, negative space, construction geometry.
3. Draw 3 or 4 variants as SVG on one exploration sheet (paper and dark backgrounds, plus a lockup with the wordmark), screenshot it, and judge with your own eyes. Reject the generic one (steam lines over a bowl is every food icon).
4. Refine the winner: one strong idea, crisp negative space, one detail that breaks the frame or reads twice.
5. Export `mark.svg`, a dark-mode variant, and any secondary seal. Convert text inside marks to outlined paths (fontTools `SVGPathPen`) so they never depend on a font.

### Shape rule (Shape Consistency Lock, write it down)
The three skills disagree (high-end: big squircles and pills; minimalist: 4-8px, no pill buttons; brutalist: zero radius). Resolve with one documented three-tier rule and follow it everywhere:
1. Media shells and panels: concentric double-bezel, outer 20-30px, inner = outer minus padding.
2. Interactive controls (buttons, chips, nav island, toggles): full pill. Inputs 12px.
3. Data surfaces (menu grid, ticket, spec tables): 0 radius, hairline structure.

### Motion rule
- `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` for entrances, `--ease-spring: cubic-bezier(0.32, 0.72, 0, 1)` for interaction. No `linear`, no `ease-in-out`.
- Animate only `transform` and `opacity` (plus a brief entrance blur).
- Every animation must answer "what does this communicate?" (hierarchy, story, feedback, state). Cut anything that only "looks cool".

---

## Phase 5: The design package (the keystone)

Design the page FIRST, completely, then decide what media it needs. Write `design/design-package.md` before building. It is the single input to the build, and **every line of copy in it ships verbatim**. Include:

1. **Brief and premise**: name, status (concept or real), feeling, chosen hero, the single CTA label (the same label everywhere it appears).
2. **Customer language**: pains, wants, objections, sources.
3. **Design read and dials.**
4. **Skill roles for this build** (how each folded-in skill shows up).
5. **Brand system**: palette token table (light and dark, with use), type trio, mark description, shape rule, motion rule.
6. **Hero band map** (if a film or scroll hero): section length (for example `340vh`), sticky stage, the action lane in the footage, and each caption band with its scroll range and exact copy.
7. **Every section**: purpose, layout family, composition anchor, background mode, verbatim copy.
8. **Layout table**: at least 4 different layout families across the page, none repeated, max 2 image-plus-text splits in a row.
9. **Eyebrow budget**: max one small uppercase label per 3 sections (hero counts).
10. **Form destination**: where submissions go, stated honestly.
11. **Media plan and image briefs** (Phase 6).

### Default section pack (adapt per business)
Hero → story/premise → the offer (menu, services, product) → the interactive moment (builder, calculator, configurator) that feeds the one CTA → how it works (3 verb-labeled steps, never "Step 1") → proof or promises (honest; no fabricated reviews for concept brands) → FAQ answering the researched objections → final call → footer with honest disclosure.

### Copy rules (write it here, deliberately)
- Plain, short, human, in the brand's register. Sized to one flick of scroll.
- Hero: headline max 2 lines; subtext max 20 words; 1 primary + max 1 secondary CTA; nothing else (no trust strip, no tagline under the CTAs, no version pill, no scroll cue).
- One label per intent across the whole page ("Order pickup" everywhere; never also "Order now" or "Get food").
- CTA labels fit one line on desktop.
- Sentence case headers. No exclamation marks. Realistic, locale-appropriate names. No fake-precise engineering numbers the brand doesn't actually claim.
- Deliberate brand devices (a planned triplet, "minutes, not hours") are craft. Drift is not.

---

## Phase 6: Media (image generation is OFF until the user connects a platform)

### While it's off
- Use the user's real photos, logo, screenshots and footage first. Real product shots can become the hero's starting frame later.
- For every place the page needs imagery the user hasn't supplied, build a **designed image slot**: a finished frame in the page's shape language (tinted surface, correct aspect ratio, `role="img"` with a real `aria-label` describing the intended image). It is a complete component, not a code placeholder.
- Write `design/image-briefs.md`: one entry per slot with section, purpose, aspect ratio, size, subject, composition (where the action sits, where text will sit), lighting and grade in the brand's palette, "no text, no logos", and brand details that must be right (the mark's color, the packaging, the dish).
- Tell the user plainly which slots are waiting and that the brief list is ready for when they connect a platform.
- Do not substitute code-rendered 3D, SVG illustrations or stock-looking filler for photography.

### When the user says a platform is connected
1. Scan: balance, models, prices. Preflight every planned image and video (cost queries are free) and present real numbers with a recommendation. One yes covers the whole path.
2. Generate from the briefs. Inspect every result yourself before showing it: anatomy, sneaked-in real trademarks, brand-detail correctness (the category's classic detail in the wrong color is a miss), composition vs the band map. Re-roll cheaply now rather than shipping a flaw.
3. **Hero film (10k Tier 1):** generate the starting frame first (cheap), show it, then pick the video model with prices in hand. Write the prompt from the storyboard: one continuous camera move, a composed resting end frame, negative space where captions live, no text in frame.
4. **GATE, the video gate:** put the video in a review folder outside the site folder, have the user watch it, give your own critique and the re-roll cost. Three failed attempts means change the concept, not the prompt.
5. Supporting stills in the same world as the hero (same palette, light, grade, described explicitly in each prompt). Parallel elements get equal treatment: if a section has three steps, all three get images.
6. When the delivered footage improves on the plan, flex the layout to feature the gift.

### Encoding a hero film (ffmpeg)
Scrubbing needs frequent keyframes. Ship H.264 and VP9 so every browser can play it:

```bash
ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 23 -g 3 -keyint_min 3 -sc_threshold 0 -bf 0 \
  -pix_fmt yuv420p -profile:v high -movflags +faststart -an site/assets/video/hero-1080.mp4
ffmpeg -i in.mp4 -vf "scale=1280:-2:flags=lanczos" -c:v libx264 -preset slow -crf 23 -g 3 -keyint_min 3 \
  -sc_threshold 0 -bf 0 -pix_fmt yuv420p -profile:v high -movflags +faststart -an site/assets/video/hero-720.mp4
ffmpeg -i in.mp4 -c:v libvpx-vp9 -crf 33 -b:v 0 -g 3 -row-mt 1 -pix_fmt yuv420p -an site/assets/video/hero-1080.webm
ffmpeg -i in.mp4 -vf "scale=1280:-2" -c:v libvpx-vp9 -crf 33 -b:v 0 -g 3 -row-mt 1 -pix_fmt yuv420p -an site/assets/video/hero-720.webm
# poster = first frame, end frame, and a portrait crop of the end frame for phones
ffmpeg -i in.mp4 -vf "select=eq(n\,0)" -frames:v 1 -c:v libwebp -quality 82 site/assets/img/hero-poster.webp
```

Keep raw files and review copies out of `site/`.

---

## Phase 7: Build

### Architecture (10k wins over taste's React default for brand sites)
One folder, no build step, deploys anywhere:

```
site/
  index.html
  404.html
  assets/css/main.css
  assets/js/main.js
  assets/fonts/*.woff2
  assets/img/*        (webp + jpg fallback, 800w and full-size variants)
  assets/video/*      (mp4 + webm, 1080 and 720)
design/               (design package, mark sources, briefs, tests; never deployed)
```

Use React/Next/Tailwind only if the user asks for an app or the project already uses them. Then follow taste's stack rules (Motion from `motion/react`, isolate client leaves, never `useState` for continuous values, Tailwind v4 config).

### Tokens (both themes, three states)
Light palette on bare `:root`; dark palette under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {...} }` AND again under `:root[data-theme="dark"]`, each with `color-scheme: dark`. Style components only through tokens. `body` gets an explicit token background. Offer a small text-based theme switch (System / Light / Dark, radio pills, stored in localStorage inside try/catch), not a sun/moon toggle.

Worked token set (calm premium): `--bg #F3F2EE`, `--surface #FBFBF9`, `--surface-2 #E9E8E3`, `--ink #17191B`, `--muted #5F605B`, `--line rgba(23,25,27,.12)`, `--field-ring rgba(23,25,27,.5)`, `--seal #C43A25` (dark `#E0563E` with `--on-seal #111213`), `--iron #111213`.

### Base
- `[hidden] { display: none !important; }`. Without it, any component with `display: grid` ignores the `hidden` attribute (this bit us: the order form stayed visible after ordering).
- `html { scroll-behavior: smooth; scroll-padding-top: ~96px; }` (auto under reduced motion).
- Grain: a fixed, `pointer-events: none` pseudo-element with an SVG `feTurbulence` noise at 3-5% opacity. Never on scrolling containers.
- z-index scale as tokens (content, overlay, nav, grain). No random `z-50`.
- Skip link, visible `:focus-visible` rings in the accent, semantic landmarks (`nav`, `main`, `section`, `article`, `footer`, `fieldset/legend`, `details`).
- Containers: `max-width: 1440px`, side gutter `clamp(20px, 5vw, 80px)`, section padding `clamp(96px, 11vw, 168px)`.
- Full-height: `height: 100svh` with a `100vh` fallback line before it. Never bare `100vh` or `h-screen`.
- Fixed and sticky things add `env(safe-area-inset-top, 0px)` to their `top` (nav, sticky hero stage, sticky side columns, overlay padding).

### Fonts and icons
- Download woff2 via the Google Fonts CSS2 API with a browser user agent, keep the `latin` subset, verify axes and glyph coverage with fontTools, declare `font-display: swap`, preload the main face.
- Icons: Phosphor, one weight for the whole site (Light fits premium). Install `@phosphor-icons/core` from npm, copy only the used SVG paths into an inline `<symbol>` sprite, reference with `<use href="#i-name">`. No Lucide, no FontAwesome, no hand-drawn icon paths.

### Components (the Double Fang set)
- **Floating island nav:** fixed, centered, detached from the top edge, pill, iron glass (`rgba(22,24,26,.8)` + `backdrop-filter: blur(18px) saturate(140%)`), hairline border, one line at desktop, height under 80px, active section link marked via IntersectionObserver + `aria-current`. Under 900px: brand + CTA + a burger whose two lines rotate into an X; a full-screen blurred overlay with links that stagger up (`translateY(48px)` to 0, 60ms apart). Escape closes; focus moves in and back. Show a small count bubble on the CTA when a cart/ticket has items.
- **Primary button (button-in-button):** pill, 54px tall, label 16/600, trailing arrow inside its own 40px circle (`rgba(255,255,255,.18)`); hover nudges the circle up-right and scales it 1.05; `:active` scales the button to .98; tinted shadow in the accent hue. Secondary = underlined text link with an offset that grows on hover. An ink (dark) variant for secondary actions like "Add".
- **Double-bezel shell:** outer wrapper with 8px padding, faint fill, 1px inner ring; inner core with a smaller concentric radius and a 1px top highlight. Use it for major media, not for everything.
- **Hairline bento (brutalist accent):** CSS grid with `gap: 1px` on a line-colored background so the gaps become perfect hairlines. Exactly as many cells as items (no empty cell). At least 2 or 3 cells with real visual variation (an image cell, an accent-tint cell, a dark cell, oversized script characters as texture). Collapse to 2 columns, then 1.
- **Choice chips:** real radio inputs inside labels, 44px pills, selected = ink fill, visible focus ring, price deltas in mono.
- **Data surface / ticket (brutalist accent):** 0 radius, 1.5px ink ring, mono uppercase with letter-spacing, dashed rules, `[ BRAND ]` framing, total in larger mono, status lines in the accent, a designed empty state, and a stamp that lands (scale 1.8 to 1 with a spring) when an order is received. Reserve space so the stamp never covers numbers.
- **Form:** label above input, 50px inputs with a 3:1 ring, helper text present, inline errors below with `aria-invalid` and `aria-describedby`, no placeholder-as-label, validation on submit then live while fixing, focus the first invalid field.
- **FAQ (minimalist):** `<details>/<summary>`, no boxes, one bottom hairline per item, a +/- made of two bars that rotates, answer fades in.
- **Oversized numeral (brutalist accent, the page's one "second-read" moment):** weight 560, `line-height: .8`, tracking `-0.07em`, caption directly beneath it, meaning something true (for example "15 minutes, give or take").
- **Footer:** mark, short nav, hours or contact, honest disclosure, a privacy line near any form, the theme switch, "Back to top".
- **404.html** in the same system.

### Motion
- Entrances: `.js .reveal` from `translateY(16px)`, `blur(6px)`, `opacity 0` to rest over 800ms with `--ease-out`, staggered by `--i` × 80ms, triggered once by IntersectionObserver (`threshold .12`). The `js` class is set by an inline head script, so no-JS visitors see everything.
- No `window.addEventListener('scroll', ...)` anywhere. Use IntersectionObserver, CSS, or a rAF loop gated by IntersectionObserver.
- `prefers-reduced-motion`: disable the scrub, show all reveals at rest, collapse transitions to 0.01ms.
- Max one marquee per page (usually zero).

### The scroll-scrubbed hero (10k engine)
Only when a real film exists (Phase 6). Otherwise build the same stage with a still image or image slot, captions and CTA, and leave the engine off.

- **Layout:** section `height: 340vh` in scrub mode; sticky stage `100dvh`; film in a rounded shell inset from the page edge; left scrim gradient where captions live; the action lane stays clear.
- **Five gates** that serve the designed still instead of the scrub: reduced motion; phones (`max-width: 760px`); small touch tablets (`pointer: coarse` and `max-width: 1100px`); Save-Data or 2g/3g; no fetch/streams or `file://`.
- **Loading:** `fetch()` the film as a Blob with a stream reader that updates a thin progress ring, then `URL.createObjectURL`. Pick 1080 when `innerWidth × devicePixelRatio > 1700`, else 720. Pick the format with `canPlayType`: H.264 MP4 first, VP9 WebM second, still hero if neither (Playwright's Chromium has no H.264; so do some Linux Firefox builds).
- **Loop:** a rAF loop runs only while the hero intersects the viewport. It reads `scrollY`, maps progress `p` to caption bands and to film time (`clamp((p - 0.04) / 0.84)` × duration, so the last frame rests under the final band), lerps the shown time by 0.16 per frame, and only seeks when not already seeking (`seeked` clears the flag). Writes to the DOM only when a value changes.
- **Bands:** each has `[inStart, inEnd, outStart, outEnd]`; opacity = in-ramp × (1 - out-ramp); translate 24px; `visibility: hidden` at zero so hidden CTAs aren't clickable. Band 0 (headline, subtext, CTAs) is visible at p = 0 and fits the first viewport.
- **Failure:** if the film fails near the top of the page, drop scrub mode and show the still hero; further down, keep the layout and let the captions play over the still. The page must be complete and beautiful if the film never loads.
- Measure the section on `resize` and with a ResizeObserver, never on scroll.

Core loop, for reference:

```js
function frame() {
  if (!running) return;
  var y = window.scrollY;
  if (y !== lastY) {
    lastY = y;
    var p = clamp01((y - top) / span);
    writeBands(p);
    target = clamp01((p - 0.04) / 0.84) * duration;
  }
  if (ready) {
    var d = target - shown;
    if (d !== 0) { shown += d * 0.16; if (Math.abs(target - shown) < 0.004) shown = target; }
    if (!seeking && Math.abs(video.currentTime - shown) > 0.01) { seeking = true; video.currentTime = shown; }
  }
  requestAnimationFrame(frame);
}
video.addEventListener('seeked', function () { seeking = false; });
```

### The interactive moment and honest forms
Give the visitor one thing to do mid-journey that feeds the CTA (for takeout: "Add" buttons on dishes plus a box builder feeding one live ticket with quantities, a total and a ready-time estimate). Announce changes in a polite live region.

A static site has no backend. Choose and state where submissions go: a JS-only success state for concepts ("This is a demo, so nothing will be sent"), a form service endpoint for real leads, or a link to an existing checkout. Build the success message to match the truth. Never claim a message was sent when it wasn't.

### Images and performance
- `<picture>` with WebP + JPEG fallback, `srcset` with 800w and full-size variants and real `sizes`, explicit `width`/`height`, `loading="lazy"` below the fold (including small decorative SVGs), `fetchpriority="high"` + a media-scoped preload for the hero still.
- Decorative oversized text (script characters used as texture) goes in CSS `content: attr(data-char)` on an `aria-hidden` element. As a text node, it fails automated contrast checks.
- Meta: title, description, theme-color for both schemes, og tags (og:image becomes an absolute URL at deploy), SVG favicon + apple-touch-icon.

---

## Phase 8: Self-test (adversarial, before showing anyone)

Serve the folder locally (`python3 -m http.server`) and write a Playwright script in `design/tests/selftest.mjs` that checks:

1. **Desktop scrub:** the film reaches `film-ready`; log film time and band opacities at p = 0, ~0.3, ~0.6, ~0.97 and back again; screenshot each.
2. **Every section** at 1440×900, screenshot each.
3. **The interactive flow:** add items, change options, check totals; submit empty (inline errors appear); submit valid (success state, form hidden, stamp clear of numbers); start over.
4. **Phone** 390×844 with touch: still hero, burger menu, every section, no horizontal overflow (`scrollWidth - innerWidth === 0`).
5. **Dark mode** (`colorScheme: 'dark'`), **reduced motion**, and **film blocked** (route-abort `.mp4` and `.webm`).
6. **Console errors** in every run: zero.

Then look at the screenshots yourself (contact sheets help). Numbers passing is not the same as the page looking right. Known traps: the `hidden` attribute losing to a component display rule; stamps or badges covering numbers; a glass nav turning muddy over light sections (raise its opacity); steam or bright image areas washing out overlaid prices (add a top scrim); the entrance blur applied to fixed elements.

Run the numbers:
- **Contrast math** on every text and boundary pair in both themes (script it: relative luminance, 4.5:1 text, 3:1 UI).
- **Lighthouse** (mobile and desktop, via `npx lighthouse` pointed at the local server with the installed Chromium). Targets: Accessibility 100, Best Practices 100, SEO 100, Performance 95+, CLS 0, TBT near 0. Cache and compression findings belong to the host; note them rather than chasing them locally.

**GATE, the copy gate** (whole file, every section, including JS-generated strings):
- Zero em dashes and en dashes (check with Python; grep's Unicode classes can fail silently).
- Zero stock words: leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions, elevate, unleash, revolutionize, next-gen, game-changer, delve, tapestry, testament, landscape.
- No "it's not just X, it's Y", no false "from X to Y" ranges, no "many experts say", no "the future looks bright", no exclamation marks in success messages, no "Oops".
- Rewrite every hit as a direct claim, re-run until clean. Deliberate brand devices from the design package stay.

---

## Phase 9: Pre-flight and audit

Tick every box honestly. Anything unticked means the page is not done.

**Taste pre-flight (condensed):**
- [ ] Design read stated; dials reasoned.
- [ ] Zero em dashes on the page.
- [ ] One theme per page (section tints within the same family are fine; dark media shells are content, not theme flips).
- [ ] One accent, used identically everywhere; one gray temperature.
- [ ] Shape rule followed everywhere.
- [ ] Every button readable (4.5:1); no CTA wraps at desktop; one label per intent.
- [ ] Hero: headline ≤ 2 lines, subtext ≤ 20 words, CTA visible without scrolling, top padding sane, ≤ 4 text elements.
- [ ] Eyebrows ≤ ceil(sections / 3).
- [ ] No split-header filler, no 3rd consecutive image+text split, ≥ 4 layout families, no family repeated.
- [ ] Bento cell count exact, 2-3 cells visually varied.
- [ ] Nav on one line, under 80px.
- [ ] No scroll cues, no version labels, no section numbering ("01 / 02"), no decorative dots, no locale/weather strips, no pills on images, no fake photo credits, no micro-meta sentences under headings, no generic step labels.
- [ ] No fake photography, no div-based fake screenshots.
- [ ] Motion motivated, reduced motion honored, no scroll listeners, cleanup on anything that observes.
- [ ] Dark mode tested; mobile collapse explicit per section; `svh`/`dvh` not `h-screen`.
- [ ] Empty, loading and error states exist.
- [ ] Phosphor icons only, one weight.

**High-end checklist:** no banned fonts, icons, harsh shadows or edge-glued nav; a chosen vibe and layout archetype; double-bezel on major media; button-in-button CTAs; section padding ≥ 96px; custom easing everywhere; entrances present; blur only on fixed elements; the overall impression reads as an expensive agency build.

**GATE, the redesign audit on your own v1 (redesign-existing-projects):** scan the build as if a stranger made it, list every finding, fix, re-test. Check typography (defaults, headline presence, measure ≤ 65ch, weights beyond 400/700, tabular or mono numbers, orphans), color (pure black, oversaturation, more than one accent, mixed gray temperatures, flat sections with no depth), layout (centered everything, 3 equal cards, `100vh`, no max-width, misaligned card CTAs), interactivity (hover, active, focus, transitions, loading, empty, error, dead links, active nav state, smooth anchors), content (generic names, round fake numbers, clichés, exclamation marks, title case), components (generic cards, accordion only when boxless, theme toggle not a sun/moon), code (div soup, alt text, z-index chaos, dead code, meta tags) and strategic omissions (privacy line near forms, skip link, 404, form validation). In the Wok Express build this pass found seven real issues; expect to find some.

**When the user brings an existing site** (not a new build): scan the stack, run this same audit first, then fix in this order: font swap → palette cleanup → hover/active states → layout and spacing → replace generic components → loading/empty/error states → type polish. Work within their stack, keep URLs, nav labels, form field names, analytics hooks and SEO intact, and change nothing on the brand mark or legal copy without asking.

---

## Phase 10: Ship

1. **README** for the repo: how to run it, what's where, how to rebuild media, honest notes (demo form, relative og:image).
2. **Commit and push** on the working branch with a clear message. Never force-push someone else's branch.
3. **Preview for the user.** When an Artifact tool is available (claude.ai and Claude Code cloud sessions), publish a private artifact so they can see it from anywhere: load the `artifact-design` skill first, then bundle a copy where the page has no `<html>/<head>/<body>` of its own, the `<title>` is just the brand name, CSS and JS are inlined, fonts become data URIs, images and video ship as published files at the same relative paths, and `.reveal` elements start visible (the artifact viewer wants content readable at rest). Keep the bundling script in `design/tools/` so republishing is one command. Tell the user if the film can't be verified inside the viewer; the still hero is the fallback.
4. **Deploy only when the user asks.** Ask which host (and whether they want a custom domain) with clickable choices. Patch og tags with the live URL, deploy the contents of `site/`, verify the live URL with real requests, run Lighthouse on the live site and show the numbers, and have the user check it on their own phone.

---

## Phase 11: The polish loop

From here on you are the user's on-call developer: they say what they want in plain words, you change it, re-test, and republish. Take feedback in rounds: structure first (right sections?), then polish (alignment, clipping, imagery), then motion (feeling alive). Apply each round in one pass. When the site goes live, tell them in one line that the door stays open.

---

## What done looks like

- The site is live (or previewed) and checked by you, not assumed.
- The hero reads instantly; any scroll film plays smoothly both ways and every caption is legible at its worst frame.
- Below the hero is a real website with one clear call to action and honest furniture: steps, promises, FAQ, a form whose success message tells the truth.
- It works on the user's phone, in both themes, with reduced motion, and with the film blocked.
- The numbers are measured and shown.
- The user looked at it and said it looks the way they pictured.
- The user never had to write code or untangle a technical detail.

---

## Worked example: Wok Express (the build this skill was written from)

- **Brief:** new Chinese takeout brand, "Wok Express", calm modern premium, no credits to spend.
- **Research language:** soggy, greasy, cold by the time it got here, wrong order, ready when I walked in, still hot when I got home.
- **Direction:** minimalist restraint + high-end Soft Structuralism, brutalist as accents (hairline menu bento, mono order ticket, a giant "15").
- **Brand:** rice paper `#F3F2EE`, ink `#17191B`, one seal red `#C43A25`, wok iron `#111213`; Archivo at width 112 + JetBrains Mono + Noto Serif TC for 鑊氣 (wok hei) only; a square red seal holding a wok bowl, with one steam stroke breaking the top edge.
- **Page:** scroll hero ("Wok hei, to go.") → the breath of the wok → six-dish bento with Add buttons → Build your box + live ticket + order form (demo success state) → "15 minutes, give or take" → app screens → four rules we cook by → FAQ → "The wok is already hot." → honest footer.
- **Lesson carried into this skill:** the design and the process landed; the code-rendered 3D imagery did not. Imagery now comes from the user's assets or a connected generator, never from code pretending to be photography.
