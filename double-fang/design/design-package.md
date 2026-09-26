# Double Fang: design package

The single input to the build. Copy below ships verbatim.

## 1. Brief and premise
- **Name:** Double Fang (working name)
- **Status:** real brand, new, launching now. No client work yet, so no reviews, no logo wall, honest promises instead.
- **Offer:** AI business models, websites, automations, AI agents, content systems.
- **Feeling:** calm dark premium.
- **Hero:** "AI builds the site". As the visitor scrolls, a real HTML website assembles itself inside a browser frame, then goes live.
- **The one CTA label:** `Book a call` (nav, hero, calculator, final form, footer).

## 2. Customer language (research)
- **Pains:** "working 60+ hour weeks", "answering the same questions all day", "outreach takes hours", "copying data between tools", "constant context switching".
- **Wants:** "get my evenings back", "leads answered even when I'm busy", "something that just works".
- **Objections:** "I don't understand AI", "agencies overpromise", "will it work with my tools?", "what does it cost?", "who owns it?"
- **Sources:** small business automation offers and toolkits (Gumroad listings), agency positioning pages, Trustpilot review of an AI tooling service. Web search surfaced marketing more than forums; the objections are the common ones repeated across those pages.

## 3. Design read and dials
> Reading this as: a service landing page for small business owners, with a calm dark premium language, leaning toward native CSS + vanilla JS, a scroll-built hero, and restrained editorial motion.

DESIGN_VARIANCE 7, MOTION_INTENSITY 7, VISUAL_DENSITY 3.

## 4. Skill roles
- 10k-websites: scroll hero engine (bands + sticky stage), copy gate, honest form, self-test.
- high-end-visual-design: floating island nav, double-bezel shells on the hero browser and form, button-in-button CTA, custom easing, blur-up entrances.
- minimalist-ui: text colors, hairlines, boxless FAQ, restraint.
- industrial-brutalist-ui (accent only): hairline `gap:1px` services bento, mono promise ticket, one oversized numeral.
- design-taste-frontend: pre-flight, eyebrow cap, layout families.
- full-output-enforcement: complete files.
- redesign-existing-projects: audit of v1 before ship.

## 5. Brand system
| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--bg` | #0B0C0E | #F1F1EE | page |
| `--surface` | #121418 | #FAFAF8 | cores, cells |
| `--surface-2` | #181B20 | #E7E7E2 | tinted cells |
| `--ink` | #ECEBE6 | #16171A | text |
| `--muted` | #9A9991 | #5B5C60 | secondary text |
| `--line` | rgba(236,234,228,.10) | rgba(22,23,26,.12) | hairlines |
| `--field-ring` | rgba(236,234,228,.42) | rgba(22,23,26,.5) | inputs (3:1) |
| `--ember` | #FF5B37 | #C9401A | the one accent |
| `--on-ember` | #1A0A05 | #FFF7F3 | text on accent |

- **Type:** Bricolage Grotesque (display, 560-620, tracking -0.04em), Geist (body), Geist Mono (numbers, labels, ticket).
- **Mark:** a rounded ember bar (the jaw line) over two inward-curving fangs. Two fangs = two halves of the offer: we design it, and we build it. Reads as a "bite" into busywork.
- **Shape rule:** media shells 28px outer / 22px inner; controls full pill, inputs 12px; data surfaces (bento, promise ticket) 0 radius, hairlines.
- **Motion rule:** `--ease-out` cubic-bezier(0.16,1,0.3,1) entrances; `--ease-spring` cubic-bezier(0.32,0.72,0,1) interaction. Transform and opacity only.
- **Theme:** dark by default (brand feeling), with a System / Light / Dark switch in the footer. Deviation from the skill's light-first default, chosen because the user picked calm dark.

## 6. Hero band map (desktop, scroll mode)
Section 320vh, sticky stage 100svh. Browser frame right, captions left, action lane is the browser.
| Band | Range (in / out) | Copy |
|---|---|---|
| 0 | 0 / 0.16 to 0.24 | **AI that actually does the work.** Double Fang builds AI business models, websites and automations that run while you sleep. One team, every part of it. [Book a call] [See what we build] |
| 1 | 0.24 to 0.30 / 0.48 to 0.54 | **You tell us what eats your week.** One call. Plain words. No AI homework. |
| 2 | 0.54 to 0.60 / 0.76 to 0.82 | **We design it, write it and build it.** Copy, layout and code, shaped around one goal. |
| 3 | 0.82 to 0.88 / stays | **It goes live. You get your week back.** [Book a call] |

Browser build: prompt types in (0.04 to 0.26), then nav, headline, subtext, button, quote card, stats row appear (0.30 to 0.70), the URL turns secure and the status reads Live (0.84).
Status lines: Reading your brief / Writing the copy / Laying out sections / Checking it on phones / Live.
Phones, touch tablets, reduced motion, Save-Data: normal-height hero, band 0 only, browser shown fully built (phones play the build once on a timer).

## 7. Sections (verbatim copy)
1. **Hero**: sticky stage, see band map.
2. **Premise** (full-width statement, words light up with scroll): "You started a business to do work you love. Not to answer the same questions all day, copy orders between tabs and chase leads at 11pm. That part is ours now."
3. **Services** (hairline bento, eyebrow "What we do"): H2 "One studio for everything AI." Lede "You bring the business. We find where AI pays off, then design it, build it and keep it running."
   - Websites that sell: "Fast, good-looking sites built around one goal: turning a visitor into a customer." (phone frame, auto-scrolling page)
   - Automations: "Your busywork, wired together and running on its own. Leads, email, invoices, follow-ups." (flow graph)
   - AI agents: "Assistants that answer customers, book appointments and qualify leads, day and night." (chat)
   - AI business models: "We find where AI makes you money or saves you hours, then build that part first." (orbit, ember-tint cell)
   - Content systems: "Posts, emails and scripts in your voice, drafted on a schedule and ready for your yes." (card fan)
4. **Estimate** (interactive moment, eyebrow "Try it"): H2 "What could AI win back for you?" sliders: People on your team / Hours each spends on repeat tasks per week / Cost of an hour of their time. Results: hours back every year, worth of time each year, full work weeks. Note: "A rough estimate, not a promise. It assumes we automate about 60% of repeat work across 48 working weeks." Button: Book a call (carries the estimate into the form).
5. **How it works** (sticky split + drawn path): H2 "From first call to live in weeks." Map: "One call to learn how your business runs. We find the hours and money AI can win back, and pick the first thing to build." Build: "We design and build it while you run your business. You see progress every few days and nothing ships without your yes." Launch: "It goes live, plugged into the tools you already use, with a short walkthrough for your team."
6. **Promises** (oversized numeral + mono ticket): numeral "3", caption "weeks, give or take, from first call to launch." H2 "Four rules we work by." Fixed price before we start / You own everything we build / Plain words, never jargon / If it won't pay off, we say so. **Confirm with the user:** the 3-week figure and these rules are proposed policy.
7. **Example builds** (horizontal pan): H2 "Things we can build for you." Booking agent / Lead engine / Store in a week / Inbox triage / Monday report / Content engine. Examples of the offer, not client case studies.
8. **FAQ** (boxless details): H2 "Questions people ask first." Five Q&As covering: AI knowledge, speed, cost, tools, ownership.
9. **Final call** (split, particle Double Fang reacting to the cursor): H2 "Tell us what eats your week." Lede "Send a few lines about your business. We reply within one business day with a first idea, free." Form.
10. **Footer**: mark, nav, disclosure, privacy line, theme switch, Back to top.

## 8. Layout table
Sticky stage hero / full-width scroll-lit statement / hairline bento / two-panel tool / sticky split with path / numeral + ticket / horizontal pan / narrow accordion / split with canvas. Nine families, none repeated.

## 9. Eyebrow budget
10 sections incl. footer, cap 3. Used: "What we do", "Try it". Total 2.

## 10. Form destination
Not connected yet. The success state says so plainly: "This is a preview, so nothing was sent yet." Before launch: a form service (Formspree or similar) or a mailto to the real inbox.

## 11. Media plan
Image generation is off. No photography on the page; every visual is the brand mark or real UI built in HTML. Image briefs for later are in `image-briefs.md`.
