# Double Fang: design package

The single input to the build. Home page copy below ships verbatim. The legal page text lives in `design/legal/`.

## 1. Brief and premise
- **Name:** Double Fang (working name)
- **Status:** real brand, new, launching now. No client work yet, so no reviews and no logo wall. Honest promises instead.
- **Offer:** AI business models, websites, automations, AI agents, content systems.
- **Based in:** Ontario, Canada. Contact: jerrydfang@gmail.com (the address the owner chose to show).
- **Feeling:** open sky. Bright, calm and clean, with one loud color.
- **Hero:** "AI builds the site". As the visitor scrolls, a real HTML website assembles itself inside a browser frame, then goes live.
- **The one CTA label:** `Book a call` (nav, hero, estimator, task globe, final form, footer).

## 2. Customer language (research)
- **Pains:** "working 60+ hour weeks", "answering the same questions all day", "outreach takes hours", "copying data between tools", "constant context switching".
- **Wants:** "get my evenings back", "leads answered even when I'm busy", "something that just works".
- **Objections:** "I don't understand AI", "agencies overpromise", "will it work with my tools?", "what does it cost?", "who owns it?", "what if I change my mind?"
- **Sources:** small business automation offers and toolkits, agency positioning pages, a review of an AI tooling service. Web search surfaced marketing more than forums. The objections are the common ones repeated across those pages.

## 3. Design read and dials
> Reading this as: a service landing page for small business owners, with a bright sky-and-cloud language, native CSS and vanilla JS, a scroll-built hero, and five showpiece interactions spaced through the page so no two sit next to each other.

DESIGN_VARIANCE 7, MOTION_INTENSITY 8, VISUAL_DENSITY 3.

## 4. Brand system

### Colors
The owner picked the three colors. Sky blue and cloud white are the quiet pair. Amber red is the loud one and is used sparingly. Its main jobs: primary buttons, the bar of the logo, one word in two headlines, the outline of the focused layer in the 3D stack, and error text.

**A note on the red.** The reference picture printed `#E0F354` next to the red swatch, but that code is a yellow-green. The swatch itself samples as `#FA2406`, so that is the red used.

| Token | Light (default) | Dark | Use |
|---|---|---|---|
| `--bg` | #FDFDFE cloud white | #04111D | page |
| `--surface` | #F1F7FD | #0A1D30 | tinted cards |
| `--surface-2` | #E2EFFB | #10283F | deeper tint, slab edges |
| `--ink` | #071A2B | #FDFDFE | text, focus rings |
| `--muted` | #47596B | #9FB4C8 | secondary text |
| `--faint` | #6B7C8D | #7D92A6 | placeholders, large dimmed text only |
| `--line` | rgba(7,26,43,.12) | rgba(253,253,254,.14) | hairlines |
| `--field-ring` | rgba(7,26,43,.5) | rgba(253,253,254,.48) | input edges (3 to 1) |
| `--sky` | #0099FF sky blue | #0A3157 | the blue world, hero panel |
| `--on-sky` | #071A2B | #FDFDFE | text on sky |
| `--sky-text` | #0068BF | #5CBCFF | small blue labels on white |
| `--card` | #FDFDFE | #0B2036 | cards inside the blue world |
| `--card-alt` | #071A2B | #F1F7FD | the one inverted card |
| `--tile-back` | #C9E6FF | #123A5F | globe tiles at the back |
| `--red` | #FA2406 amber red | #FA2406 | buttons, logo bar, headline word |
| `--on-red` | #04111D | #04111D | label on a red button |
| `--red-text` | #C81D05 | #FF6A52 | small red text (errors) |

Rules that came out of the contrast math (`design/tests/contrast.py`, 25 pairs, both themes, all pass):
- White on sky blue is only 3 to 1, so text on sky is always dark ink (5.9 to 1).
- White on the red is 3.9 to 1, so button labels are near-black (4.8 to 1).
- Red on sky is 1.3 to 1, so red is never used for text or lines on blue. A red button on blue gets a white ring around it.
- Small red text uses the darker `--red-text`.

### Type
Bricolage Grotesque (display, 560 to 620, tracking -0.04em), Geist (body), Geist Mono (numbers, labels, the house rules ticket). All three are served from the site. Licenses: `site/licenses.html`.

### Mark
A rounded red bar (the jaw line) over two inward-curving fangs. Two fangs for the two halves of the offer: we design it, and we build it. The fangs take the text color, so the mark works on white, on sky and in the dark theme.

### Shape, motion, theme
- **Shape:** media shells 28px outer and 22px inner. Controls are full pills, inputs 12px. In the blue world, cards are rounded white tiles.
- **Clouds:** soft CSS gradients that drift slowly. No image files.
- **Motion:** `--ease-out` cubic-bezier(0.16,1,0.3,1) for entrances, `--ease-spring` cubic-bezier(0.32,0.72,0,1) for interaction. One shared animation loop. No scroll listeners. Scroll-driven fades never run on a fixed timer: the scroll says where a value is going, and a short glide in time limits how fast it gets there.
- **Theme:** light by default, because the palette is a daytime sky. A System / Light / Dark switch sits in the footer. The page uses `data-mode` on `<html>`, not `data-theme`, so a preview host cannot flip it by accident.

## 5. The five showpiece interactions
Each one has a job, a touch version and a still version for people who turn motion off.

| # | Asked for | Where | What happens | Phone | Reduced motion |
|---|---|---|---|---|---|
| 1 | Breaking the fourth wall: a finger wipes fog | Top of Services | A round window is fogged over. A finger writes "hi" in the fog, then the visitor wipes it clear with the cursor. Drips run down. "Clear it for me" does the same by button. | Wipe with a real finger | The window is left out |
| 2 | Portal | Same spot, on scroll | The wiped window grows until the sky inside it fills the screen. The visitor passes through into the blue Services world. | Same, scroll driven | The section opens as a plain blue panel with its heading |
| 3 | 3D product | "Look inside one build" | The example roofing site lifts apart into five floating layers: Page, Words, Agent, Wiring, Tools. Scroll steps through them one at a time, each sliding out with its caption, then the stack closes. It tilts a little with the cursor. Every slide, fade and caption follows the scroll and also eases in time, so nothing snaps even on a hard flick. If the scroll stops half way through a change, the change finishes by itself. | Same, scaled to fit | The stack sits open and still, with all five captions listed beside it |
| 4 | Object reveal on hover | "Things we can build for you" | Six plain rows. Hovering a row makes a small mock-up of that build appear and follow the cursor. Keyboard focus shows it too. | Each mock-up sits under its row and pops in on scroll | Still appears on hover, with no glide or tilt |
| 5 | 3D sphere gallery | "Pick what eats your week" | Thirty everyday chores on a globe that turns slowly. Drag to spin it, tap to pick, and the picks carry into the form. Arrow keys and space work as well. | Sixteen tiles on a smaller globe, tap to pick | Globe holds still until you move it |

Also kept from the first build: the scroll-built hero, the premise words that light up, the particle logo in the final section that scatters from the cursor.

## 6. Hero band map (desktop, scroll mode)
Section 320vh, sticky stage 100svh. Captions left. The browser sits on a sky blue panel with clouds on the right.
| Band | Range (in / out) | Copy |
|---|---|---|
| 0 | 0 / 0.16 to 0.24 | **AI that actually does the work.** Double Fang builds AI business models, websites and automations that run while you sleep. One team, every part of it. [Book a call] [See what we build] |
| 1 | 0.24 to 0.30 / 0.48 to 0.54 | **You tell us what eats your week.** One call. Plain words. No AI homework. |
| 2 | 0.54 to 0.60 / 0.76 to 0.82 | **We design it, write it and build it.** Copy, layout and code, shaped around one goal. |
| 3 | 0.82 to 0.88 / stays | **It goes live. You get your week back.** [Book a call] |

Browser build: the prompt types in (0.04 to 0.26): "Build a site for Gable & Slate Roofing. Goal: more inspection bookings." Then nav, headline, subtext, button, quote card and stats row wipe in (0.30 to 0.64). At 0.84 the address turns secure and the status reads Live.
Status lines: Reading your brief / Writing the copy / Laying out sections / Checking it on phones / Live.
Phones, touch tablets, reduced motion and Save-Data: normal-height hero, band 0 only. Phones play the build once on a timer. Reduced motion shows it already built.

The example business is made up. It was first called "Northside Roofing", which is likely the name of real companies, so it became "Gable & Slate Roofing" with the address `gableandslate.example`.

## 7. Sections (verbatim copy)
1. **Hero**: sticky stage, see band map.
2. **Premise** (full-width statement, words light up with scroll): "You started a business to do work you love. Not to answer the same questions all day, copy orders between tabs and chase leads at 11pm. That part is ours now."
3. **Services** (fog window, portal, then a bento of white cards on sky; eyebrow "What we do"):
   - Fog captions: "Busywork fogs up your week." / "Go on, wipe it off." Button: "Clear it for me", then "Fog it up again".
   - H2 "One studio for everything AI." Lede "You bring the business. We find where AI pays off, then design it, build it and keep it running."
   - Websites that sell: "Fast, good-looking sites built around one goal: turning a visitor into a customer." (phone frame, page scrolls by itself)
   - Automations: "Your busywork, wired together and running on its own. Leads, email, invoices, follow-ups." (flow graph)
   - AI agents: "Assistants that answer customers, book appointments and qualify leads, day and night." (chat)
   - AI business models: "We find where AI makes you money or saves you hours, then build that part first." (orbit, on the one dark card)
   - Content systems: "Posts, emails and scripts in your voice, drafted on a schedule and ready for your yes." (card fan)
4. **Inside one build** (3D stack, still in the blue world): H2 "Look inside one build." Captions, in order:
   - "From the outside, one page. This is the example roofing site from the top of this page. There is more underneath."
   - The page: "What the customer sees. Fast, clear and built around one goal."
   - The words: "Copy in the customer's own language, written to earn a yes."
   - The agent: "Answers questions and books the inspection, day and night."
   - The wiring: "Each new lead lands in the right place with nobody copying and pasting."
   - Your tools: "It all plugs into the inbox, calendar and CRM you already use."
   - "Back in one piece. The customer sees a simple page. It quietly does five jobs."
5. **Estimate** (two-panel tool): H2 "What could AI win back for you?" Sliders: People on your team / Hours each spends on repeat tasks per week / Cost of an hour of their time. Results: hours back every year, worth of time each year, full work weeks. Note: "A rough estimate, not a promise. It assumes about 60% of repeat work can be automated across 48 working weeks. Your numbers will differ." Button: Book a call (carries the estimate into the form).
6. **How it works** (sticky split with a drawn path): H2 "From first call to live in weeks." Map: "One call to learn how your business runs. We find the hours and money AI can win back, and pick the first thing to build." Build: "We design and build it while you run your business. You see progress every few days and nothing ships without your yes." Launch: "It goes live, plugged into the tools you already use, with a short walkthrough for your team."
7. **Promises** (oversized numeral and a mono ticket): numeral "3", caption "weeks is our target, from first call to launch. Bigger builds ship in stages." H2 "Four rules we work by." Fixed price before we start / You own everything we build / Plain words, never jargon / If it won't pay off, we say so.
8. **Things we can build** (rows with hover objects): H2 "Things we can build for you." Lede "Six examples to start the conversation. Yours gets built around your own business." Rows, each ending "Ask about this":
   - Booking agent: "Answers DMs and books appointments around the clock. Picture a hair studio."
   - Lead engine: "Finds, scores and emails local leads. Picture a roofing company."
   - Store in a week: "A fast shop site with product pages drafted by AI and checked by a person."
   - Inbox triage: "Sorts, drafts and flags email before anyone logs in. Picture a small law office."
   - Monday report: "Pulls numbers from five tools into one clear email every week."
   - Content engine: "Turns one founder video into a week of posts in their own voice."
9. **Pick what eats your week** (globe on a sky block; eyebrow "Your turn"): H2 "Pick what eats your week." Lede "Spin the globe and tap anything you would rather not do yourself. We will start there." Counter: "Nothing picked yet." Button: Book a call. Thirty tiles, from "Answer DMs" to "Research competitors".
10. **FAQ** (boxless details): H2 "Questions people ask first." Six questions:
    - Do I need to know anything about AI? "No. You know your business, we know the tools. We explain every choice in plain words and hand you something that just works."
    - How fast can you ship? "We aim to get a website or a single automation live in two to four weeks. Bigger systems ship in pieces, so you get value early instead of waiting for the whole thing."
    - What does it cost? "Every project gets a fixed price in writing after the first call. Running costs such as hosting or AI usage are listed on the same quote, so nothing shows up later. If we cannot find a clear return for you, we will say so."
    - What if I change my mind? "Before work starts, you get a full refund. After that, you pay only for finished stages, and monthly plans cancel anytime with no fee. The refund policy has the details."
    - Will it work with the tools I already use? "Almost always. Gmail, Outlook, Shopify, HubSpot, Notion, Slack, Google Sheets and most booking tools connect without you switching anything."
    - Who owns what you build? "You do. Accounts are opened in your name from day one, and each stage of work is yours once it is paid for."
11. **Final call** (split, with the particle logo): H2 "Tell us what eats your week." Lede "Send a few lines about your business. We reply within one business day to set up a call." Form: Your name / Email ("We reply here, nowhere else.") / What is this about? / What takes up too much of your week? ("Optional. A line or two is plenty.") / "I am 18 or older, and I agree to the privacy policy." / Book a call. Under the button: "This opens your email app with the note ready to send. We only use your details to reply. No mailing lists, never sold."
    - Topics: Not sure yet, help me find it / A website / An automation / An AI agent / A content system / A new AI business model / Cancel a plan or ask for a refund / Delete my data.
    - Sent card: "One more tap, [name]. Your email app should have opened with your note ready. Press send there and it reaches us. Nothing opened? Write to us directly." Then the address, "Copy address", "Open my email app", "Write another".
12. **Footer**: mark, one-line blurb ("AI business models, websites and automations for small businesses. New studio, taking its first clients now."), business details, site links, legal links (Privacy policy, Terms of service, Refund policy, Cookie policy, Delete my data, Privacy choices), theme switch, Back to top. Base line: "Examples on this page show the kind of work we do. They are not client case studies." and "Fonts and icons licenses".

**Privacy banner** (every page, first visit): "Your privacy, your call. This site saves two things in your browser: your theme and this choice. No ads and no tracking. We do not run analytics today. If we ever add them, they stay off unless you say yes." Buttons: "Essential only" / "Allow analytics".

## 8. Layout table
Sticky stage hero / full-width scroll-lit statement / round window that becomes a portal / bento of cards on sky / sticky 3D stage with captions / two-panel tool / sticky split with path / numeral and ticket / list rows with a floating object / globe on a sky block / narrow accordion / split with canvas. Twelve families, none repeated.

## 9. Eyebrow budget
12 sections including the footer, cap 3. Used: "What we do", "Your turn". Total 2.

## 10. Form destination
`mailto:` to the studio address. The button opens the visitor's own email app with the note filled in, and the sent card says plainly that one more tap is needed. Nothing is sent or stored by the site. To deliver notes without that tap, connect a form service later and name it in the privacy policy.

The same form also takes the two legal requests: "Cancel a plan or ask for a refund" and "Delete my data". Links from the legal pages open it with the right topic already picked (`index.html?topic=delete#contact`).

## 11. Legal layer
Five pages share the home page's footer and privacy banner: privacy, terms, refunds, cookies, licenses. All are written in short plain sentences with a "short version" box on top. `design/legal-checklist.md` maps every legal item to its place and lists what is left for the owner.

## 12. Media plan
No image files. Every visual is the mark or real interface drawn in HTML, CSS, SVG or canvas, so there is nothing to license and nothing that could pass for a fake photo. Image ideas for later are in `image-briefs.md`.

## 13. Stated exceptions to the house rules
- **Motion beyond transform and opacity.** The portal grows a `clip-path` circle, and the hero pieces wipe in with `clip-path`. Fades on the hero pieces failed the contrast audit halfway through, and the portal cannot be done with transform alone. Each one paints a single layer. Measured result: 99 performance on mobile.
- **Focus rings are ink, not the accent.** Red on sky blue is 1.3 to 1, which nobody could see. Ink passes everywhere.
- **Button labels are dark, not white.** White on this red is 3.9 to 1, under the 4.5 needed for small text.
- **The consent box is the one place a form asks for more than contact details.** It doubles as the age check, so the form stays at four fields and one box.
