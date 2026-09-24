# Wok Express: design package

The single input to the build (10k-websites Phase 5). Copy in this file ships verbatim.
Band ranges and pacing numbers are starting points, validated later by the flick test.

## 1. Brief and brand premise

- **Brand:** Wok Express. Chinese name 鑊氣 (wok hei, "breath of the wok").
- **Status:** new brand, concept stage. Every image is a 3D render made in code. The footer says so.
- **Feel (user pick):** calm modern premium.
- **Hero (user pick):** "The box opens."
- **Premise:** takeout that keeps the thing takeout usually loses. Wok hei fades in minutes, so every box is fired to order and handed over hot.
- **Single call to action:** `Order pickup` (same label everywhere: nav, hero, settle band, final section). It leads to the Build your box + order section (`#order`).

### Customer language (Phase 3 research)

Pains, in buyers' words: "soggy", "greasy", "in a pool of grease", "no crunch", "cold by the time it got here", "wrong order", "missing items", "waited over an hour", "bland", "couldn't taste any wok hei", "very wet texture".
Wants: "ready as soon as I walked in", "still hot when I got home", "ready for pickup in 10 minutes", "made to order", "consistently on point", "notified when it's ready".
Objections to answer: Will it be soggy by the time I'm home? Is it greasy? Will my order be right? How long do I wait? Allergies? Delivery?

Sources: wanderlog.com takeout review pages; burpple.com/wok-hey/reviews; danielfooddiary.com/2017/03/14/wokhey; Yelp and Tripadvisor Chinese takeout listings.

## 2. Design read and dials (design-taste-frontend)

> Reading this as: a premium-consumer landing page for a new takeout brand, for hungry locals who pick up after work, with a calm modern premium language, leaning toward native CSS + vanilla JS, a scroll-scrubbed 3D hero film, and restrained editorial motion.

- `DESIGN_VARIANCE: 7` (premium consumer, asymmetric but calm)
- `MOTION_INTENSITY: 6` (hero scrub + entrances + hover physics, nothing looping for show)
- `VISUAL_DENSITY: 3` (airy, expensive)

## 3. How each skill is used

| Skill | Role in this build |
|---|---|
| 10k-websites | Backbone: phases, scroll-scrubbed hero film, design package, copy gate, self-test. Architecture: one `index.html` + `assets/`, no build step. Hero film generated in code (Three.js frames + ffmpeg) because the user chose not to spend Higgsfield credits. |
| brandkit | Brand strategy, seal logo system, 3x3 identity board rendered to PNG. |
| imagegen-frontend-web | One horizontal comp image per section (9 sections, 9 images), rendered from HTML in Chromium. |
| imagegen-frontend-mobile | Three app screens in a clean phone mockup, logical flow: menu, build, pickup ticket. Shipped as images in the App section. |
| image-to-code | Deep analysis of every comp before implementation; build matches comps. |
| design-taste-frontend | Design read, dials, anti-slop rules, final pre-flight matrix. |
| high-end-visual-design | Floating island nav, hamburger morph, double-bezel media shells, button-in-button CTA, custom cubic-bezier motion, blur-up entrances. |
| minimalist-ui | Typographic colors, hairline system, muted pastel dietary tags, boxless FAQ accordion with + / - toggle. |
| industrial-brutalist-ui | Used as an accent, since the user chose calm: Swiss `gap: 1px` hairline menu grid, the mono uppercase order ticket, `[ ]` framing, 0-radius data surfaces, and the oversized "15" numeral. |
| full-output-enforcement | Every file complete. No placeholders, no TODOs, no skipped sections. |
| redesign-existing-projects | Audit pass on the finished v1 (scan, diagnose, fix) before shipping. |

## 4. Brand system (brandkit)

- **Category:** wok-fired Chinese takeout, pickup first.
- **Audience:** busy locals, students, after-work pickup; people who have been burned by soggy, late takeout.
- **Personality:** calm, precise, warm, quick without rushing.
- **Core metaphor:** the seal (a promise stamped) holding the wok's breath (steam).
- **Primary mark:** a vermilion square seal. A paper-colored wok bowl with an upturned handle sits in the lower half; one steam stroke rises and breaks through the top edge (express).
- **Secondary mark:** 鑊氣 character seal, outlined to paths, used as a stamp (ticket received, packaging side panel).
- **Tagline:** Wok hei, to go.

### Palette tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F3F2EE` rice paper | `#111213` wok iron | page canvas |
| `--surface` | `#FBFBF9` | `#1A1C1E` | raised panels, ticket |
| `--surface-2` | `#E9E8E3` | `#222427` | quiet tint cells |
| `--ink` | `#17191B` | `#ECEBE6` | text |
| `--muted` | `#5E6166` | `#A3A4A0` | secondary text |
| `--line` | `rgba(23,25,27,.12)` | `rgba(236,235,230,.12)` | hairlines |
| `--seal` | `#C43A25` | `#E0563E` | the one accent |
| `--on-seal` | `#FBFBF9` | `#111213` | text on accent |
| `--iron` | `#111213` | `#0B0C0D` | film window, iron cell |

Dietary tags (minimalist-ui pastels): Vegan `#EDF3EC / #346538`, Spicy `#FDEBEC / #9F2F2D`, Peanuts `#FBF3DB / #956400`. Dark mode uses tinted versions of the same hues.

Saturation of the accent stays under 80%. Light accent on paper passes 4.7:1; dark accent on iron passes 4.9:1.

### Type trio

- **Display and body:** Archivo (variable, width 62 to 125, weight 100 to 900). Headlines at `font-stretch: 112%`, weight 560, tracking `-0.035em`. Body at width 100, weight 400, `line-height: 1.6`.
- **Mono:** JetBrains Mono for prices, times, the ticket.
- **Chinese:** Noto Serif TC 900, subset to the 32 characters used. The only serif on the page, used as texture and seal.

### Shape rule (taste Shape Consistency Lock, documented)

1. Media shells and panels: double-bezel, outer radius 22px, inner radius 16px (concentric).
2. Interactive controls (buttons, chips, nav island, inputs): full pill. Inputs 12px.
3. Data surfaces (menu grid, order ticket): 0 radius, hairline structure.

### Motion rule

- Curves: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` for entrances; `--ease-spring: cubic-bezier(0.32, 0.72, 0, 1)` for interaction.
- Entrances: `translateY(16px)`, `blur(6px)`, `opacity 0` to rest over 800ms, staggered 80ms, via IntersectionObserver.
- Buttons: `scale(.98)` on press; nested arrow circle nudges up-right on hover.
- No `scroll` event listeners. The hero loop is a rAF loop that runs only while the hero is on screen and rests when the scrub settles.
- `prefers-reduced-motion`: no scrub, no entrances, still hero.

## 5. Hero film and band map (10k Tier 1)

- **Film:** 6 s, 180 frames, 1920x1080, rendered from `design/render/scene.html`. Box closed on a dark iron counter; camera rises; side flaps then front/back flaps unfold; wire handle folds back; steam curls up and drifts back; settles looking down into glossy noodles, box right of center.
- **Action lane:** right 55% of frame. Captions live in the left 45% over dark negative space, with a soft left scrim.
- **Scroll length:** hero section `340vh`, sticky stage `100dvh`.
- **Mobile, reduced motion, save-data, or film fails:** designed still hero (poster frame) with the same headline and CTA. No pin.

| Band | Scroll progress | Copy |
|---|---|---|
| 0, opening | 0.00 to 0.14 | H1 **Wok hei, to go.** Sub: *Noodles and rice fired one order at a time, packed to stay crisp, and ready when you walk in.* CTAs: `Order pickup`, `See the menu` |
| 1, lid opens | 0.22 to 0.42 | **Fired the moment you order.** / Nothing waits under a heat lamp. |
| 2, steam | 0.50 to 0.70 | **That smoky edge is wok hei.** / It fades in minutes, so we hand it over fast. |
| 3, settle | 0.80 to 1.00 | **Still hot when you get home.** CTA `Order pickup` |

## 6. Sections below the hero (copy verbatim)

### 6.1 The breath of the wok (`#story`)
- Eyebrow: The breath of the wok
- H2: Most takeout loses the best part on the way home.
- Body: Wok hei is the smoky, just-seared taste you only get from a very hot wok. It lasts minutes, not hours. So we cook every box to order and pack it to breathe, not sweat.
- Visual: side render of the closed box in a double-bezel shell; oversized 鑊氣 in Noto Serif TC as texture.

### 6.2 Menu (`#menu`)
- H2: What's in the wok.
- Sub: Six dishes, each built for the trip home. Crisp things stay crisp. Sauced things stay glossy.
- Cells (6, gapless hairline bento):
  1. **Beef chow fun** 乾炒牛河, $16.50. Wide rice noodles, seared flank, bean sprouts, scallion, dark soy. (large cell, top-down render)
  2. **Hot oil noodles** 油潑麵, $13.75. Wide wheat noodles, chili, garlic and scallion, finished with sizzling oil. Tags: Vegan, Spicy. (seal tint cell, big 辣)
  3. **Salt and pepper tofu** 椒鹽豆腐, $12.25. Crisp tofu, fried garlic, green chili. Sauce on the side, always. Tag: Vegan.
  4. **Char siu fried rice** 叉燒炒飯, $14.25. Roast pork, egg, peas and scallion, in rice cooked a day ahead so it fries dry.
  5. **Kung pao chicken** 宮保雞丁, $15.50. Chicken thigh, peanuts, dried chili, Sichuan pepper. Tags: Spicy, Peanuts. (iron cell)
  6. **Pork and chive potstickers** 韭菜豬肉鍋貼, $10.50. Eight, pan-fried, crisp side up. Black vinegar to dip.

### 6.3 Build your box and order (`#order`), the interactive moment
- H2: Build your box.
- Sub: Pick a base, a protein and a sauce. Your ticket updates as you go.
- Base ($11.50): Egg noodles, Wide rice noodles, Jasmine fried rice
- Protein: Beef +$3.00, Chicken +$2.00, Tofu +$0.00, Shrimp +$3.50
- Sauce: Black bean, Garlic chili, Ginger scallion
- Heat: None, Mild, Hot, Wok-fire
- Ticket (mono, uppercase, 0 radius): `[ WOK EXPRESS ]`, `TICKET NO. 0417`, one line per choice with price, `TOTAL`, `READY IN ABOUT 14 MIN`.
- Form: Name, Mobile number, Pickup (`As soon as it's ready`, `In 30 minutes`, `In 1 hour`). Button: `Place order`.
- Helper: We only use your number to text you when your box is bagged.
- Errors: Add your name so we can call it out. / Enter a 10-digit mobile number.
- Success (JS only, honest): stamp 鑊氣 lands on the ticket, status `RECEIVED`. Message: **Order received.** This is a demo, so nothing will be cooked. When Wok Express opens, this is where you'll get your ready time by text.

### 6.4 How it works (`#how`)
- H2: Ready when you walk in.
- Numeral: **15**, caption: minutes, give or take.
- Steps (verbs as labels, no numbering):
  - **Order.** Build your box here. The ready time shows before you pay.
  - **We fire it.** Your ticket goes straight to a hot wok. One order per wok, every time.
  - **Pick it up.** We text you when it's bagged. Walk in, grab it, go.

### 6.5 App (`#app`)
- Eyebrow: The app
- H2: Your usual, two taps away.
- Sub: Save a box, reorder it in seconds, and watch your ticket count down to pickup. Coming to iOS and Android.
- Visual: three phone screens (menu, build, pickup ticket) in a Z-axis cascade.

### 6.6 Promises (`#promises`)
- H2: Four rules we cook by.
- **Crisp stays crisp.** Vented boxes, and sauce packed on the side for anything fried.
- **One wok, one order.** Nothing is batch-cooked or kept warm under a lamp.
- **Checked twice.** Every bag is read back against your ticket before it's sealed.
- **Ready means ready.** You get a text when it's bagged, not while it's still in the wok.

### 6.7 FAQ (`#faq`)
- H2: Before you order.
- How long does an order take? / Most boxes are ready in 12 to 18 minutes. Your exact ready time shows on the ticket before you pay.
- Do you deliver? / Pickup only for now. A closed bag in a delivery car is where crisp food goes soft, so we'd rather hand it to you hot.
- What about allergies? / Every dish lists peanuts, sesame, gluten, shellfish and egg. We can use a clean wok on request, but our kitchen handles all of them, so we can't promise zero cross-contact.
- What's vegan? / Hot oil noodles and salt and pepper tofu are fully vegan. Any box can swap its protein for tofu.
- Can I order for a group? / Yes. For 10 boxes or more, give us an hour's notice so we can fire them in waves and hand them over hot.

### 6.8 Final call (`#last`)
- H2: The wok is already hot.
- Sub: Open daily, 11:30 am to 10 pm. Pickup only.
- CTA: `Order pickup`
- Visual: film end frame, reused as the section's image.

### 6.9 Footer
- Mark + Wok Express. Links: Menu, How it works, FAQ, Order pickup.
- Hours: Open daily, 11:30 am to 10 pm.
- Disclosure: Wok Express is a concept brand. Every image on this page is a 3D render, and the menu, prices and app are samples.
- © 2026 Wok Express

## 7. Layout families (taste: at least 4 across the page, no repeats)

| Section | Family | Composition anchor | Background mode |
|---|---|---|---|
| Hero | scroll-pinned film | bottom-left text over image | full-bleed film in shell |
| Story | off-grid editorial offset | right-third caption, left visual | solid + oversized CJK texture |
| Menu | gapless asymmetric bento | top-left lead | hairline grid, mixed cells |
| Order | tool panel: options + ticket | two columns, ticket sticky | solid surface |
| How | oversized numeral + stacked steps | numeral left, steps right | solid |
| App | stacked center + cascade | centered statement | soft tint |
| Promises | sticky heading + rhythm list | top-left lead | solid |
| FAQ | boxless accordion | centered narrow column | solid |
| Final | mini minimalist over image | centered low | end frame, dark scrim |

Eyebrows: Story, App (2 of max 3).

## 8. Form destination (honest)

Static site, no backend. The order form uses a JS-only success state and sends nothing. When the brand goes live, point it at an ordering system or a form service (Formspree or similar) and change the success copy to match.

## 9. Image analysis (image-to-code), extracted from the comps at 1600px

Comps: `design/comps/web/section-01-hero.png` to `section-09-final.png` (one per section) and `design/comps/mobile/app-*.png`.

| Element | Extracted value | Build token |
|---|---|---|
| Side gutter | 80px at 1600 | `clamp(20px, 5vw, 80px)` |
| Media shell inset / radius | 14px / 30px (film, final) | `--shell-inset`, `--r-shell` |
| H1 | 104px, lh .96, width 112, wt 560, -0.045em, 2 lines | `clamp(3rem, 6.5vw, 6.6rem)` |
| H2 | 60px, lh 1.02, -0.04em | `clamp(2.2rem, 3.8vw, 3.8rem)` |
| Lead | 20px, lh 1.55, muted, 46ch | `clamp(1.05rem, 1.25vw, 1.25rem)` |
| Primary button | 54px tall pill, label 16/600, nested 40px circle at 18% white | `.btn` |
| Nav island | top 34px, links 15/500, gap 30px, CTA 42px, glass iron 62% | `.nav` |
| Menu bento | cols 2fr 1fr 1fr, rows 1fr 1fr .8fr, 1px ink gaps, feature spans all 3 rows | `.bento` |
| Menu cell | pad 24px, h3 22px (feature 34px), mono price 15px top-right, serif zh 15px top-left, big char 150px at 8% | `.dish` |
| Chips | 44px pill, 15/500, selected = ink fill | `.chip` |
| Ticket | 1.5px ink border, 0 radius, mono 14px lh 2.1 uppercase, total 22px, ready line in seal | `.ticket` |
| Inputs | 50px, radius 12px, surface fill, 1px line ring | `.field input` |
| Numeral | 620px at 1600 (about 39vw), wt 560, -0.07em, caption directly under it | `.big-num` |
| Steps | grid 170px / 1fr, 30px rows, hairline above each | `.steps` |
| App phones | 300px wide, outer two rotated -3 / +3 deg and dropped 70 / 90px | `.phones` |
| Promises | sticky heading 72px, rows grid 280px / 1fr, 34px padding, hairline between | `.rules` |
| FAQ | 820px column, question 21/600, answer 17/1.6, +/- toggle | `.faq` |
| Final | 620px shell, left-third headline 84px, linear scrim from left | `.last` |

Fixes found during analysis and regenerated as fresh comps:
1. Menu: feature cell left an empty black block (spanned 2 of 3 rows). Now spans all 3. Big character alpha lowered so text stays clean.
2. How: the "minutes, give or take" caption had drifted to the page bottom. Now sits right under the numeral.
3. Final: centered headline sat over the busiest part of the image. Moved to the left third with a linear scrim; image pushed right.
4. App phones: transparent exports carried the presentation canvas in the rounded corners. Re-exported with fully transparent corners.

## 10. Encode recipes (10k Phase 7)

Run from `design/render/` after `node render.mjs film 180 1920 1080`. Raw frames stay out of `site/`.

```bash
# H.264 for scrubbing: keyframe every 3 frames, no B-frames, no audio, faststart
ffmpeg -framerate 30 -i frames/frame_%04d.png -c:v libx264 -preset slow -crf 23 -g 3 -keyint_min 3 -sc_threshold 0 -bf 0 \
  -pix_fmt yuv420p -profile:v high -movflags +faststart -an ../../site/assets/video/hero-1080.mp4
ffmpeg -framerate 30 -i frames/frame_%04d.png -vf "scale=1280:-2:flags=lanczos" -c:v libx264 -preset slow -crf 23 -g 3 \
  -keyint_min 3 -sc_threshold 0 -bf 0 -pix_fmt yuv420p -profile:v high -movflags +faststart -an ../../site/assets/video/hero-720.mp4

# VP9 WebM for browsers built without H.264
ffmpeg -framerate 30 -i frames/frame_%04d.png -c:v libvpx-vp9 -crf 33 -b:v 0 -g 3 -row-mt 1 -deadline good -cpu-used 2 \
  -pix_fmt yuv420p -an ../../site/assets/video/hero-1080.webm
ffmpeg -framerate 30 -i frames/frame_%04d.png -vf "scale=1280:-2:flags=lanczos" -c:v libvpx-vp9 -crf 33 -b:v 0 -g 3 -row-mt 1 \
  -deadline good -cpu-used 2 -pix_fmt yuv420p -an ../../site/assets/video/hero-720.webm

# poster (first frame), end frame, phone still (portrait crop of the end frame)
ffmpeg -i frames/frame_0000.png -c:v libwebp -quality 82 ../../site/assets/img/hero-poster.webp
ffmpeg -i frames/frame_0179.png -c:v libwebp -quality 82 ../../site/assets/img/hero-end.webp
ffmpeg -i frames/frame_0179.png -vf "crop=860:1080:720:0" -c:v libwebp -quality 80 ../../site/assets/img/hero-mobile.webp
```

## 11. Self-test results (10k Phase 9)

- Scrub: film time 0.00 s at 0%, 1.99 s at 32%, 4.14 s at 62%, 5.99 s at 97%; scrolling back to 30% returns to 1.86 s. Caption bands hand off one at a time.
- Ordering: dish adds, box builder, quantity controls, inline errors, success state, new ticket all work.
- No console errors on desktop light, desktop dark, phone, reduced motion, or with the film blocked. No horizontal overflow at 1440px or 390px.
- Film blocked or undecodable: the page collapses to the still hero near the top of the page.
- Lighthouse (local server, no compression): mobile Performance 97, Accessibility 100, Best Practices 100, SEO 100 (LCP 2.6 s on simulated slow 4G, CLS 0, TBT 0 ms, 293 KiB). Desktop Performance 100 (LCP 0.5 s).
- Copy gate: zero em or en dashes, zero stock words, no exclamation marks.

Fixed during self-test: form stayed visible after ordering (`[hidden]` overridden by `display: grid`), seal stamp covered the pickup time, nav island muddy over light sections, feature menu cell price lost in steam, Playwright Chromium has no H.264 (added VP9 WebM with `canPlayType` detection), decorative CJK texture flagged by axe (moved to CSS content), input borders under 3:1, mixed warm and cool grays, linear easing on the loader.
