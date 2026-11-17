# Double Fang: legal checklist

Where each item from the two lists lives on the site, how it is checked, and what is still yours to do.

**Read this first.** These pages are plain-language drafts written for a small studio in Ontario, Canada. They follow Canada's privacy law (PIPEDA) and anti-spam law (CASL), with short notes for visitors from the EU, the UK and California. They are not legal advice. Have a lawyer read the four policies before you rely on them.

Three kinds of status are used below:
- **Built**: it works on the site today and a test checks it.
- **Promise**: the site says it in writing. It only stays true if you run the business that way.
- **Nothing to build yet**: the site has no feature that needs it. The note says what to add if that changes.

## List 1: the 20 items

| # | Item | Status | Where it lives |
|---|---|---|---|
| 1 | Privacy policy | Built | `site/privacy.html`. Linked from the footer of every page and from the consent line in the form. 13 short sections: what is collected, why, who sees it, how long it is kept, your rights, how to delete. |
| 2 | Terms of service | Built | `site/terms.html`. Linked from every footer. Covers estimates, quotes, ownership, AI-made work, limits on responsibility, Ontario law. |
| 3 | Refund policy | Built, and a Promise | `site/refunds.html`. Linked from every footer, from the FAQ ("What if I change my mind?") and from the terms. Full refund before work starts, pay only for finished stages after, monthly plans cancel anytime with no fee. |
| 4 | Cookie policy | Built | `site/cookies.html`. Lists the only two things saved in the browser: `df-theme` and `df-consent`. The site sets no cookies at all. |
| 5 | Cookie consent banner | Built | The "Your privacy, your call" banner on every page (`assets/js/site.js`). Two buttons of equal weight: "Essential only" and "Allow analytics". Nothing is saved before a choice. The choice is asked again after 12 months. "Privacy choices" in every footer reopens it. |
| 6 | Check form consents | Built | The form has one unticked box: "I am 18 or older, and I agree to the privacy policy." It is required and never pre-ticked. There is no hidden marketing consent. The line under the button says exactly what happens next. |
| 7 | No unnecessary data | Built | The form asks for a name, an email, a topic and an optional message. No phone number, no address, no company size. Lines carried in from the estimator or the task globe are shown in the message box, where the visitor can edit or delete them. |
| 8 | Audit third-party SDKs | Built | There are none. No analytics, ad pixels, chat widgets, embeds or outside fonts. The self-test fails if the site calls any other website. The only outside links are two plain links (the Privacy Commissioner and the icon makers). |
| 9 | Remove dark patterns | Built | Both banner buttons look the same. No pre-ticked boxes, no countdowns, no "only 2 spots left", no pop-ups that block the page, no guilt wording on the "no" choice. Cancelling and deleting use the same form as booking, and both are linked from every footer. |
| 10 | Remove hidden fees | Promise | The site shows no prices. The FAQ, the terms and the refund policy all say the same thing: one fixed price in writing, with running costs such as hosting or AI usage listed on the same quote. |
| 11 | Remove fake reviews | Built | There are no testimonials, star ratings, client logos or "trusted by" numbers. Every example business is made up, and the site says so in the footer, in the terms and on the licenses page. |
| 12 | Remove unsupported claims | Built | The estimator shows its own assumptions and says "A rough estimate, not a promise." "3 weeks" is called "our target". The FAQ says "We aim to". No "number one", no "guaranteed results". |
| 13 | Accessibility: alt text | Built | The site has no photo files. Each drawn graphic either has a spoken label (for example the hero browser and the phone) or is hidden from screen readers because it is decoration. Lighthouse accessibility score: 100. |
| 14 | Fix color contrast | Built | `design/tests/contrast.py` checks 25 color pairs in both themes against WCAG AA. All pass. The tightest ones: button label on red 4.82 to 1 (needs 4.5), input edges 3.39 to 1 (needs 3). |
| 15 | Keyboard navigation | Built | Skip link first. A clear focus ring on every stop. The phone menu keeps focus inside it. The task globe works with arrow keys and space. The hover objects also appear on keyboard focus. The fog has a "Clear it for me" button, so nothing needs a mouse. |
| 16 | Add business details | Built, partly | Every footer and every policy shows: Double Fang, Ontario, Canada, and the contact email. Still missing: a registered business name or number and a mailing address. See "Before you launch". |
| 17 | Age consent for kids' data | Built | The site is for business owners aged 18 or older. The form asks the visitor to confirm it. Privacy policy section 9 says the site is not for children and that anything sent by a child is deleted. |
| 18 | Unsubscribe link in emails | Nothing to build yet | There is no mailing list and the site sends no email. Privacy policy section 10 says a newsletter would be opt-in only, with a working unsubscribe link. See "Before you launch" for what CASL needs on the day you send one. |
| 19 | License fonts and images | Built | `site/licenses.html`, linked from every footer. Fonts are under the SIL Open Font License 1.1 and icons under the MIT License. The full license texts ship in `site/assets/licenses/`. No stock photos are used. |
| 20 | Data deletion request | Built, and a Promise | "Delete my data" is in every footer. It leads to three plain steps and a red button in privacy policy section 7. The button opens the form with "Delete my data" already picked. You then have to do the deleting, within 30 days. |

## List 2: the 5 items

| # | Item | Status | Where it lives |
|---|---|---|---|
| 1 | Cancel button | Built for what exists | The site has no accounts and no online checkout, so there is nothing to click "cancel" on. The path is the "Cancel or refund" button in the refund policy, which opens the form with "Cancel a plan or ask for a refund" picked. One email is enough, with no fee and no notice period. |
| 2 | Delete account | Built for what exists | There are no accounts. "Delete my data" (item 20 above) does the same job for the details a visitor has sent. |
| 3 | Age check | Built | The required "I am 18 or older" box on the form. It is a self-declared check, which fits a contact form for business owners. |
| 4 | Unsubscribe | Nothing to build yet | Same as item 18 above. |
| 5 | Privacy policy | Built | Same as item 1 above. |

## How the checks run
```bash
python3 -m http.server 8765 -d site &
node design/tests/selftest.mjs     # 71 checks
python3 design/tests/contrast.py   # contrast, both themes
```
The self-test checks that fit this list: the banner shows on a first visit, both choices look the same, nothing is stored before a choice, "Essential only" keeps analytics off, "Privacy choices" reopens the banner, there are still no cookies, the consent box is required and not pre-ticked, the "Delete my data" link preselects the request, all internal links resolve, every stop has a focus ring, and no request leaves the site.

## Before you launch: yours to do

**1. Get the policies read by a lawyer.** An hour with someone who knows Ontario small business law is enough for a site this size.

**2. Make sure every promise is true.** The site says all of this in writing. Change the text if you want to run things differently.
- You reply to enquiries within one business day.
- You answer privacy requests, including deletion, within 30 days.
- Enquiries that go nowhere are deleted within 12 months.
- Full refund until the start date on the quote. After that the client pays only for finished stages.
- Monthly plans cancel anytime, with no fee and no notice period.
- Refunds go back within 10 business days.
- Costs paid to other companies (a domain, hosting, a subscription) are not yours to refund once bought.
- Every project gets a fixed price in writing, with running costs on the same quote.
- Client accounts are opened in the client's name. Each stage belongs to the client once paid.
- "3 weeks" is the target for a first build. The FAQ says two to four weeks.
- Your total responsibility for paid work is limited to what the client paid for it.
- Ontario law applies and disputes go to Ontario courts.

**3. Business details.** In Ontario, a business that trades under a name other than the owner's own legal name normally has to register that name. Check this for "Double Fang". Once you have a registered name, a business number or a mailing address, add them to `SITE` in `design/tools/pages.py` and to the footer in `site/index.html`, then run `python3 design/tools/pages.py`.

**4. Name your hosting company.** Privacy policy sections 4 and 5 say "our hosting provider". When you pick one, name it there and say which country it keeps its logs in.

**5. If you add analytics.** Load them only after the visitor picks "Allow analytics". The hook is already in place:
```js
DF.onConsent(function (c) { if (c && c.analytics) { /* load analytics here */ } });
```
Then list the tool in the cookie policy and in privacy policy sections 3 and 5.

**6. If you connect a form service.** Name it in privacy policy section 5 and rewrite the paragraph in section 2 that says the form sends nothing to a server.

**7. If you ever send marketing email.** Canada's anti-spam law (CASL) asks for three things in every message: consent first, your name and mailing address plus one way to reach you, and an unsubscribe link that works and is honored within 10 business days.

**8. Outreach you build for clients.** The "Lead engine" example sends email to businesses. Under CASL that is only allowed when the address was published openly without a "no unsolicited mail" note and the message is about the reader's own line of work. Every such email still needs the sender's details and an unsubscribe link. Build those rules into each one.

**9. If you add real client reviews later.** Use them only with written permission, do not edit what the client said, and never pay for or invent one.

**10. If you add accounts or online payments.** Add a cancel button and a delete-account button inside the account area. Cancelling has to be as easy as signing up.

**11. Keep the date honest.** Each time a policy changes, update `DATE` in `design/tools/pages.py` and rebuild.

**12. Taxes.** The terms say taxes are shown on each quote. Ask an accountant when you need to start charging HST.
