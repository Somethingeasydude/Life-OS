# OvisCanem.com — Website Revision Brief

**Prepared for:** Robert (Development & Hosting)
**Prepared by:** Ovis (Vision & Content)
**Date:** August 20, 2026
**Version:** 1.4 *(supersedes v1.3 — home page verse locked, Morning App promoted above demos, free trivia categories named, lapse and lockout rules defined, win-back email added, social media footer added, Discord plan added)*

---

## 1. Purpose

Rebuild the front end of oviscanem.com around a single flat-rate founding-member offer, a free no-signup demo experience, and a gospel page — and build the underlying system so it can flip to an annual subscription model without a rewrite.

The site has two jobs, in this order:

1. **Convert cold traffic (mostly TikTok, mobile, women 35+) into paying members.**
2. **Put the gospel in front of every visitor whether they buy or not.**

Everything below serves one of those two jobs. If a proposed feature serves neither, it waits.

**Most important architectural note for Robert:** the site launches selling a one-time lifetime purchase, but within a foreseeable timeframe it will sell an annual subscription alongside a second lifetime tier. **Build for all three products now.** Product type, price, and billing interval should be configuration, not code. Flipping from Phase 1 to Phase 2 must be a settings change, not a rebuild. Choose the payment processor and account structure accordingly — pick one that handles recurring billing well from day one, even though nothing recurs yet.

---

# Division of Responsibility — Read This First

Three people touch this project. Nothing below is optional, and most of Robert's work is blocked until Ovis delivers content. **Ovis is the bottleneck, not Robert.** Content should be moving before development starts.

## ROBERT OWNS — Build, Hosting, Infrastructure

Robert builds everything technical. He writes no content, makes no doctrinal or pricing decisions, and never has to guess at wording — if copy is missing, he puts in an obvious placeholder and tells Ovis, rather than inventing it.

**Stage 1 — Foundation (start here, blocks everything else)**

1. Select and configure the payment processor. **Must handle recurring billing well from day one**, even though nothing recurs yet. §1, §5.7
2. Build the pricing system with all three products defined: $37 one-time, $57 annual, $197 one-time. Products 2 and 3 hidden but functional. Price and billing interval must be **configuration, not code**. §5.1–5.3
3. Build member accounts: auto-created at checkout, no manual step ever. §6.1
4. Build login, password reset, multi-device sessions. §6.2
5. Build the member dashboard. §6.3

**Stage 2 — Site Structure**

6. Delete the About page, 301 redirect, remove from nav/footer/sitemap, run a full link check. §3.1
7. Delete all tier pricing sitewide. §3.1
8. Build the home page layout — offer above the fold on a phone. §4.1
9. Build the Gospel page layout with response link. §4.3
10. Build the Statement of Faith page layout. §4.5
11. Build the Refund Policy page, footer/checkout links, and the timestamped acknowledgment checkbox. §4.6
12. Build the Contact page. §4.7
13. Preserve color scheme, logo, and Hebrews verse throughout. §2

**Stage 3 — Demos & Growth Features**

14. Build the Morning App block on the home page, above the demos, with share button and built-in "Made by OvisCanem" attribution. §4.1a
14b. Build the two demos to run with **no account and no gate**. §4.4
14c. Build the Gospel trivia category end screen linking to the gospel page. §4.4
15. Build the beta notice on flashcards and trivia, in both free and member versions. §8
16. Build the feedback form with **automatic context capture** (tool, chapter/category, device), routed **by message type** — bugs/games to the Discord webhook, gospel responses and billing to private email, on separate paths that cannot be merged. §8, §12A.3
17. Build share buttons, native share sheet, and Open Graph preview tags on every shareable page. §9
18. Build the skippable email capture on the demo end card. §10
19. Wire up the email sequence: welcome, receipt, password reset. §11
20. Build the FAQ, previews, and testimonials sections as containers ready to receive Ovis's content. §12
21. Build the footer social bar — YouTube, TikTok, Discord — with links in an editable config file and the Discord slot rendering nothing until a URL exists. §12A.1
22. Build the lapse logic: 14-day grace, then full lockout, account retained, no revocation of downloaded files, Morning App still available. §5.5a
23. Wire the automated win-back email at lockout. §11.6
24. Implement analytics events. §13

**Stage 4 — Data & Launch**

22. Upgrade all existing $7 and $24 members to founding membership; **verify no access is lost**. §5.4
23. Secure workbook PDF delivery so files aren't publicly reachable. §14
24. Give Ovis a private view of the current founder count. §5.6
25. Allow a small overage past 1,000 so no in-progress checkout fails. §5.6
26. Run the full acceptance checklist, including a real test purchase and password reset on an iPhone. §17

**Robert also owns, ongoing:** hosting, uptime, backups, security patches, and the Phase 2 toggle when Ovis calls for it.

## OVIS OWNS — Content, Copy, Doctrine, Decisions

Every item here blocks something Robert is building. Priority order:

**First — Decisions (Robert can't finish Stage 1 without these)**

1. Answer the five open questions in §16.1 — especially **what happens when an annual membership lapses**.
2. Name the single monitored email address. §16.1
3. ~~Confirm the Hebrews verse.~~ **Done — Hebrews 13:20–21.** §2.1
4. Supply the YouTube and TikTok URLs. §12A.1
5. Create the Discord server — permanent invite, seeded channels, moderation decided. **Not a launch blocker.** §12A.2

**Second — Core Copy (blocks Stage 2)**

4. Gospel page copy, KJV. §4.3
5. Statement of Faith — **final wording, Ovis's alone. Not Robert's, not a placeholder.** §4.5
6. Home page headline and offer copy. §4.1
7. "What's Included" final wording. §4.2
8. Refund policy final wording. §4.6

**Third — Demo & Member Content (blocks Stage 3)**

9. Proverbs 1 flashcard content, export-ready. Demo 2
10. Write the trivia question banks for **The Gospel** and **Who Jesus Is in the Bible** — new categories, ten questions minimum each, reverent and plainly factual. Confirm the existing **Is It King James?** bank is export-ready. §4.4
11. The full library Robert loads behind the login: all 31 chapters of flashcards, workbooks, curriculum. §6.3
12. Morning App handoff to Robert, with the "Made by OvisCanem" attribution built in. §4.1a

**Fourth — Conversion Content (needed before launch, not before build)**

13. Approve beta notice wording. §8
14. Approve share message copy. §9
15. Approve FAQ answers. §12.2
16. Approve the welcome email. §11.1
17. Workbook preview page images, **including the fold-in-half layout**. §12.1
18. Grandfather email to existing $7 and $24 members — and ask them for testimonials in it. §11.4
19. Approve the win-back email. §11.6
20. Approve the Morning App framing line and the Gospel category end-screen line. §4.1a, §4.4
21. Approve any additional Scripture Robert or Jared proposes for the site, emails, or curriculum. **No verse ships unapproved.** §2.1

**Ovis also owns, ongoing:** confirming ownership and access per §7; watching the private founder count and calling the Phase 2 toggle; producing the annual new product line that gives annual members a reason to renew; and reading the beta feedback inbox.

## JARED OWNS — Marketing Assets

1. Open Graph preview image, 1200×630. §9
2. Collect and format member testimonials once Ovis's grandfather email goes out. §12.3
3. Traffic — TikTok content driving to the demos, not to the home page.

## Not Robert's Call, Ever

Doctrine and Scripture selection. Pricing. What "lifetime" covers. Whether founding membership reopens. Refund policy language. If any of these come up mid-build, they go to Ovis.

---

## 2. Preserve — Do Not Change

These elements are approved and stay exactly as they are. Build around them.

| Element | Note |
|---|---|
| **Color scheme** | Keep as-is sitewide. Carry it into all new pages so the site stays visually consistent. |
| **Logo — shepherd, dog, and sheep** | Keep. Remains the primary brand mark in the header and on all share/link previews. |
| **Hebrews 13:20–21 on the home page** | **Confirmed and locked.** Sits directly beneath the logo, on every visitor's first screen. See §2.1. |

Any new page must inherit the existing color scheme, typography, and logo placement.

### 2.1 The Home Page Verse — Hebrews 13:20–21

This is **the only Scripture that appears in the site's permanent chrome.** It is not decoration and it is not to be rotated, shortened, or replaced.

> *"Now the God of peace, that brought again from the dead our Lord Jesus, that great shepherd of the sheep, through the blood of the everlasting covenant, make you perfect in every good work to do his will, working in you that which is wellpleasing in his sight, through Jesus Christ; to whom be glory for ever and ever. Amen."*
> **— Hebrews 13:20–21, KJV**

**Placement:** logo first, verse immediately beneath it, then the offer. This is the visitor's first screen. It states who the ministry serves before it states what it sells.

**Robert:** copy the text **verbatim from the existing site** — KJV spelling and punctuation exactly as it stands, including "wellpleasing" as one word. Do not retype from memory and do not let a spell-checker or CMS autocorrect touch it. If the rendering on the current site differs in any character from the text above, the current site wins.

**Other Scripture elsewhere on the site** (demo pages, emails, curriculum) is permitted and encouraged, but every additional verse must be **submitted to Ovis for approval before it goes live**. No verse ships unapproved.

---

## 3. Scope of Work

### 3.1 Remove

| Item | Action |
|---|---|
| About Me page | Delete page, remove from nav/footer, remove from sitemap.xml, 301 redirect `/about` → `/` |
| Tiered pricing ($7 / $24 / $37) | Delete all three tiers and any comparison table |
| Founder counter | **Not to be built.** No public count of members sold, no "X of 1,000" display, no progress bar. Count is tracked privately (§5.6). |
| Any nav links pointing to removed pages | Clean up header, footer, and mobile menu. Run a full link check after removal. |

### 3.2 Add / Rebuild

| Priority | Item | Section |
|---|---|---|
| P0 | Home page rebuilt around the $37 founding offer | §4.1 |
| P0 | "What's Included With Your Membership" list | §4.2 |
| P0 | Member account + dashboard (auto-created at checkout) | §6 |
| P0 | Gospel page — second item in nav | §4.3 |
| P0 | Refund policy page | §4.6 |
| P0 | Pricing architecture that supports all three products | §5 |
| P1 | Free demo hub — three demos, no signup | §4.4 |
| P1 | Beta notice + feedback mechanism | §8 |
| P1 | Share buttons with pre-written messages | §9 |
| P1 | Optional email capture on demos | §10 |
| P1 | Statement of Faith page | §4.5 |
| P1 | Contact / support page | §4.7 |
| P1 | Welcome email at purchase | §11.1 |
| P2 | FAQ, workbook previews, testimonials | §12 |
| P2 | Analytics events | §13 |

---

## 4. Page Specifications

### 4.1 Home Page — The Offer

**The offer must be the first thing on screen. Above the fold, no scrolling, on a phone.**

Structure, top to bottom:

1. **Logo** (shepherd, dog, sheep) — existing placement.
2. **Headline** — the promise, one line. Copy from Ovis.
3. **Price block:**
   - **$37 — Founding Membership**
   - Subline: *One payment. Lifetime access. No subscription, ever.*
   - Scarcity line, **no numbers**: *Founding membership is limited to the first 1,000 members. When it closes, membership becomes $57 per year — founding members will never be billed again.*
4. **Primary CTA button** — large, thumb-sized, high contrast. Straight to checkout.
5. **Secondary CTA (text link, smaller):** *"Try it free first — no signup"* → jumps to the demo section.
**Corrected order — the verse moves up.** Final home page structure, top to bottom:

1. **Logo** (shepherd, dog, sheep)
2. **Hebrews 13:20–21** — directly beneath the logo (§2.1)
3. **Headline** — the promise, one line
4. **Price block** — $37, lifetime, capped at 1,000
5. **Primary CTA** — straight to checkout
6. **The Morning App — free, no signup** (§4.1a)
7. **Secondary CTA:** *"Try the study tools free — no signup"* → demos
8. **Below the fold, in order:** What's Included → Demos → Workbook previews → Testimonials → FAQ → repeat CTA

### 4.1a The Morning App — Promoted Above the Demos

The Morning App is no longer buried in the demo section. It sits **on the home page, above the demos**, as the first thing a visitor can actually touch.

**Why it's placed there:** it is free, it is complete, it asks nothing, and it works in one tap. It's the ministry's open hand — a visitor who buys nothing still leaves with something worth having.

**Specification:**
- Its own block on the home page, between the primary CTA and the demo section.
- Free permanently, to everyone, with no signup, no email, and no account. **This is a giveaway, not a teaser, and the wording must never imply otherwise.**
- Short framing line — draft, Ovis to approve: *"Start every morning in the word of God. Free to use, free to keep, free to share — no signup, nothing to buy."*
- **Share button directly on the block** (§9), not only at the end.
- **Attribution is built in:** every screen of the Morning App and every share of it carries **"Made by OvisCanem"** with a link back to the site. Wherever this tool travels, it carries the ministry's name with it.
- Same treatment persists inside the member dashboard — members reach the same app, not a different one.

**Do not put a contract, terms wall, or long legal text in front of the offer.** Terms are a link near the button, not a barrier.

### 4.2 "What's Included With Your Membership"

Appears on the home page below the offer and again on the checkout page. Draft copy below — Ovis to approve final wording.

> **Your Founding Membership Includes**
>
> - **The complete Bible trivia library** — every category unlocked, including People, Places, Miracles, Women of the Bible, Is It King James?, and Grammar, with new categories added as they are released.
> - **Full access to every flashcard study** — all thirty-one chapters of Proverbs, verse by verse, with Hebrew word study, Strong's references, and King James grammar breakdown.
> - **The complete printable workbook library** — chapter workbooks built for personal study, family devotions, and classroom use, released on an ongoing basis.
> - **The Bible teaching curriculum** — structured, King James–based teaching material for those who want to study Proverbs seriously or teach it to others.
> - **Full access to the Morning App** — start each day in the Word with personalized Scripture.
> - **Every future release, included** — as a founding member, everything we produce from here forward is yours at no additional cost, for life.
> - **Your price, locked forever** — one payment of $37. You will never be billed again.

**Honesty requirement:** items not yet complete must be represented as *released on an ongoing basis* or *in active development* — never as available today. Same principle as the beta notice (§8). This is a ministry; the marketing has to be true.

### 4.3 Gospel Page — "Have You Heard the Gospel?"

- **Second item in the main nav**, on every page, always visible on mobile.
- Simple, plain, one screen of scrolling. KJV text only.
- No pricing, no upsell, no signup wall of any kind on this page.
- Copy supplied by Ovis. Dev builds the layout to receive it.
- Share button (§9), with its own message.
- **Response path at the bottom:** a link reading *"I'd like to talk to someone"* or *"I made a decision today,"* routing to the ministry inbox. Without this, someone the Lord moves on that page has no way to reach you.

### 4.4 Demo Section — "Try It Free"

Three demos. **No account, no email, no credit card, no gate.** Visitor clicks and it works.

*(The Morning App has moved up to the home page — see §4.1a. Two demos remain in this section.)*

**Demo 1 — Proverbs Chapter 1 Flashcards**
- Complete flashcard system for Proverbs 1 only.
- Carries the beta notice (§8).
- Chapters 2–31 visible but locked, with one line: *"Unlock all 31 chapters — become a founding member, $37."*

**Demo 2 — Bible Trivia Game**

Three free categories, **confirmed by Ovis**:

| Category | Status | Note |
|---|---|---|
| **The Gospel** | New — questions to be written | See special handling below |
| **Who Jesus Is in the Bible** | New — questions to be written | Names, titles, and offices of Christ |
| **Is It King James?** | Existing bank | Already developed |

- **Ten questions minimum per category.** Fewer than that and the demo feels like a fragment rather than a complete experience.
- Carries the beta notice (§8).
- All remaining categories visible but locked, with the one-line unlock message.

**Special handling — the Gospel category end screen.** When a player finishes The Gospel category, the end card leads with a link to the gospel page (§4.3) before it shows the share button or the $37 CTA. Draft line, Ovis to approve: *"These questions are about the most important thing in the world. If you've never settled it for yourself, take two minutes."* This turns a game into an invitation, and it costs nothing to build.

**Note on tone:** trivia about the gospel has to be handled with more care than trivia about who built the ark. Questions should be plainly factual and reverent, never clever at Scripture's expense. Ovis writes them.

**End card after any demo** — three options, no clutter:
1. Share button (§9)
2. Optional email capture (§10)
3. The $37 CTA

### 4.5 Statement of Faith Page

Removing the About page removes the only thing telling a visitor who is teaching them. This page carries that trust instead, without making the site about a person.

- Short — five to eight lines. Plain language.
- Covers: the King James Bible as the preserved word of God; salvation by grace through faith in Jesus Christ alone; the necessity of the new birth; fundamental Baptist doctrinal position.
- Linked in the footer and from the gospel page.
- **Final wording is Ovis's alone.** Doctrine is not the developer's call and not a placeholder. A draft skeleton is below for Ovis to rewrite entirely:

> **What We Believe**
>
> We believe the King James Bible is the preserved, inspired word of God in English, and it is the only text we teach from.
>
> We believe salvation is by grace, through faith in the Lord Jesus Christ, and by nothing else — not works, not baptism, not church membership.
>
> We believe every person must be born again.
>
> We believe the book of Proverbs is God's wisdom given to His people for daily living, and that it is worth studying carefully, word by word.
>
> We are a fundamental Baptist ministry. Everything on this site is built from that position, plainly and without apology.

### 4.6 Refund / Cancellation Policy Page

**Phase 1 (now) — one-time purchase:**
- Title: **Refund Policy**
- Core statement: **All sales are final. No refunds.** One sentence, at the top.
- Justification line: instant-access digital content delivered in full at purchase.
- Linked in the footer and directly beneath the checkout button.
- Required checkbox at checkout: *"I understand all sales are final and no refunds are issued."* **Log the timestamp with the order record.**

**Phase 2 (annual subscription) — separate policy required:**
- The "all sales final" language was written for a one-time purchase and does **not** cover a subscription cleanly. A distinct **cancellation policy** must be added before the first recurring product goes live, covering: how to cancel, when access ends after cancellation, and whether partial periods are refunded (recommend: no refunds, access continues to the end of the paid term).
- Auto-renewal carries real disclosure obligations — clear terms at signup, notice before each renewal, and a cancellation path that isn't buried.

> **Flag for Ovis:** "All sales final" does not stop a chargeback; processors generally side with the cardholder, and the checkbox plus timestamp is what you use to contest one. Subscription disclosure rules are stricter than one-time-purchase rules. Have someone qualified review both policies before Phase 2. This brief is not legal advice.

### 4.7 Contact / Support Page

- One page, one email address, plainly displayed.
- Serves four purposes: beta feedback, purchase support, gospel-page responses, and billing questions.
- Required by most payment processors regardless. Build once, link from the footer, the beta notice, and the gospel page.

---

## 5. Pricing Architecture — Two Phases, Three Products

This is the most important section for Robert. **Build all three products now.** Phase 2 is a configuration change.

### 5.1 Product Definitions

| # | Product | Price | Billing | Availability | Access |
|---|---|---|---|---|---|
| 1 | **Founding Membership** | $37 | One time | First 1,000 members only, then permanently closed | Everything, including all future releases, for life |
| 2 | **Annual Membership** | $57 | Recurring, yearly | Phase 2 onward | Everything released to date, for as long as the membership is active |
| 3 | **Lifetime Membership** | $197 | One time | Phase 2 onward | Everything, including all future releases, for life |

### 5.2 Phase 1 — Now

- Only Product 1 is on sale. The site shows one price and one button.
- Products 2 and 3 exist in the system but are hidden.

### 5.3 Phase 2 — At 1,000 Founding Members

- Product 1 closes permanently. **Founding membership is never reopened.** Its value to the first thousand depends on it being genuinely closed, and those thousand are the ones whose word of mouth carries the ministry. If a future promotion is wanted, discount the *first year* of the annual ($37 first year, $57 after) — same entry price, same feeling of a deal, no broken promise.
- Home page switches to showing Product 2 ($57/year) as primary and Product 3 ($197 lifetime) as the alternative for people who don't want a subscription.
- **Toggle is manual.** Ovis throws the switch. Do not automate this — Ovis may want to time it with an announcement.

### 5.4 Grandfathering — Non-Negotiable

- Existing **$7 and $24 members are upgraded to full Founding Membership at no charge.** Same access, same lifetime terms, no action required from them. Notify them by email (§11.4).
- These upgrades **count against the 1,000 cap.**
- **No member's access is ever downgraded or deleted.** Under any circumstance.
- Founding members are never billed again, ever, under any pricing change.

### 5.5 Renewal Model — How Annual Members Stay

Ovis's model, stated plainly so it can be built:

- **A new product line is launched annually** — new chapters, new workbook sets, new curriculum modules.
- **Active annual members receive each new release automatically** as part of their subscription.
- **A lapsed member keeps what they had; they simply stop receiving anything new.** *(See decision point below.)*
- Lapsed members remain on the email list and are notified when new material launches, with an invitation to reactivate or to buy the $197 lifetime.

### 5.5a Lapse & Lockout — DECIDED

**Ovis's ruling, final. Build exactly this:**

**Day 0 — payment fails or membership is not renewed.**
- Access continues in full. Nothing changes for the member yet.
- Failed-payment notice sent, with retry attempts per the processor's dunning schedule.

**Days 1–14 — grace period.**
- **Full access continues for fourteen days.** No degradation, no nag screen blocking content, no partial lockout.
- One or two reminder emails during the window. Warm, not threatening.

**Day 15 — lockout.**
- **Full lockout.** The account no longer opens the flashcards, the trivia library, the workbooks, or the curriculum. Login still works; it lands on a reactivation screen instead of the dashboard.
- **What the member keeps:** anything already downloaded to their own phone or computer — workbook PDFs, printed pages, saved files. Those are theirs. **We do not attempt to revoke, expire, or remotely disable anything a member has already downloaded.** Nothing in the delivery system may be designed to reach back into a member's device.
- **What the member loses:** everything that lives on the site.
- **The Morning App remains free and available**, because it is free to everyone including strangers. A lapsed member is not treated worse than a visitor who never paid at all.
- **The account is not deleted.** Their record, their history, and their email are retained. Reactivating restores full access immediately with no re-registration.

**Day 15 — automated win-back email** goes out (§11.6), offering two doors: renew annually, or move up to the $197 lifetime.

**Build note for Robert:** no per-member content snapshots. Access is binary — active or locked. That decision is what keeps this buildable; preserving "what each member had during their paid term" is a hard engineering problem and a permanent support burden, and it was deliberately rejected.

### 5.6 Founder Count

- Tracked **privately only** — payment processor dashboard and internal analytics.
- **Never displayed publicly.** No counter, no progress bar, no "almost gone" widget.
- Ovis needs a private view of the current count to know when to flip to Phase 2.
- **Member #1,001 edge case:** anyone who reaches checkout while the founding offer is live gets honored, even if it pushes past 1,000. It's a handful of people, and turning someone away over a counter is a poor first impression. Build the cutoff to allow a small overage rather than hard-failing a transaction in progress.

### 5.7 Subscription Machinery — Required for Phase 2, Chosen Now

Recurring billing brings infrastructure that must be planned for at processor-selection time, not retrofitted:

- Failed-payment retry logic and dunning emails
- Renewal reminder before each charge
- Self-service cancellation from the member dashboard
- Grace period on failed payment before access is cut (recommend 14 days)
- Prorated upgrade path: **annual member → $197 lifetime**, ideally crediting their current unexpired term
- Clear billing history visible to the member

---

## 6. Member Account & Dashboard

This was the largest gap in earlier drafts. Full spec:

### 6.1 Account Creation

- **The account is created automatically at checkout.** The member never fills out a separate registration form. Email plus password (or a magic-link email login) is set during or immediately after payment.
- On successful payment: account created → access granted → welcome email sent (§11.1) → member lands directly on the dashboard, already logged in. **No manual step by Ovis or Robert, ever.**

### 6.2 Login

- Persistent **"Sign In"** link in the header on every page, including mobile.
- **Working password reset.** Non-negotiable. The core audience is women 35+ on phones and tablets; forgotten passwords are the number one support issue and every one of them will land in Ovis's inbox.
- **Multi-device access** — same account works on phone, tablet, and desktop. No device limits.
- **Sessions stay signed in.** Do not force re-login every visit.

### 6.3 Member Dashboard

The first screen after login. Simple, large tap targets, no clutter:

- **Continue where you left off** — last chapter or study opened
- **Flashcard Studies** — all 31 chapters
- **Trivia** — all categories
- **Workbooks** — downloadable PDFs, organized by chapter
- **Curriculum** — teaching modules
- **Morning App** — link through
- **My Account** — email, password, membership type, billing history, and (Phase 2) cancel subscription
- **Send Feedback** — link to the beta feedback path (§8)

### 6.4 Membership Badge

Display membership type on the dashboard: **Founding Member**, **Lifetime Member**, or **Annual Member**. Founding members should see something that marks them as first. It costs nothing and it matters to them.

---

## 7. Ownership & Access — Administrative Note

Not a development task, but it belongs in writing.

Robert hosts; Ovis owns the domain. Before launch, confirm that **Ovis holds direct access to** the payment processor account, the customer and email list, the domain registrar, and the code repository — in his own name, with his own credentials, not through someone else's login.

Nothing is wrong. This is written down because ministries and family businesses both go sideways when nobody documented who holds what. Ten minutes now saves a hard conversation later.

---

## 8. Beta Program — Flashcards & Trivia

Flashcards and trivia are in beta. Say so plainly. Honesty builds trust with this audience and turns early users into contributors rather than critics.

**Placement:**
- Small, non-blocking banner or badge at the top of the flashcard and trivia experiences.
- Shown in **both** the free demos and the member versions.
- Must not cover content or interrupt play. It informs; it does not gate.

**Draft copy (Ovis to approve):**

> **Beta** — This study tool is still being built and refined. You're among the first to use it. If something doesn't work right, or if you see a way to make it better, we want to hear from you.
> **[Send us your feedback]**

**Feedback mechanism:**
- Short in-page form (name optional, email optional, message required). A `mailto:` link is an acceptable fallback but converts worse.
- **Automatically append context to every submission:** which tool, which chapter or category, and device/browser. "It broke" with no context cannot be acted on.
- All feedback routes to one monitored inbox (§4.7).
- Feedback link also appears on the demo end card and in the footer.

**Recommended, low effort:** a short **"What's New"** line or changelog on the demo pages — even three bullets. It proves the beta is actively worked on, which is the difference between "unfinished" and "in development."

---

## 9. Share Functionality

Every demo and the gospel page gets a share button. This is the traffic engine — P1, not a nice-to-have.

**Mechanics:**
- Native mobile share sheet where available (iOS/Android); simple menu fallback on desktop.
- Channels: **text message, email, Facebook, copy link.**
- Shared link goes **directly to the demo the person was using**, not to the home page.
- **Open Graph / link preview tags on every shareable page:** title, one-line description, and the logo or a branded image. A share that previews as a blank grey box does not get clicked.

**Demo share message (draft, Ovis to approve):**

> I've been using this and thought of you. It's free — no signup, nothing to buy. Take a look, enjoy it, and come be a part of what the Lord is doing here.
> [link]

**Gospel page share message (draft, Ovis to approve):**

> This is worth two minutes of your time.
> [link]

Message text lives in an editable config file, not hard-coded. Ovis and Jared will revise it.

---

## 10. Email Capture on Demos

**The problem this solves:** if a hundred people arrive from one TikTok video and three buy, the other ninety-seven leave no trace and can never be reached again. Winning them back requires a whole new video. One optional line converts a portion of them into people who can be invited back next week.

**Specification:**
- Appears on the demo end card, **after** the demo is finished.
- One field, one line: *"Want the next chapter when it's ready?"*
- **Fully skippable.** A visible, obvious dismiss. It never blocks the demo, never covers content, never appears before the demo, and never appears twice in a session.
- Submitting adds them to the mailing list. Not submitting costs them nothing.

This is the single highest-leverage small feature in the brief.

---

## 11. Email Sequence

All emails carry the logo and the existing color scheme. Plain, warm, not corporate.

### 11.1 Welcome Email — Sent Immediately on Purchase

> **Subject: Welcome, founding member — you're in.**
>
> Friend,
>
> Thank you. You didn't just buy access to a study tool — you helped start something, and we don't take that lightly.
>
> You now have full access to everything: all thirty-one chapters of Proverbs, the flashcard studies, the complete trivia library, the workbooks, the teaching curriculum, and the Morning App. Your price is locked for life. You'll never be charged again.
>
> **[Sign in and start studying →]**
>
> A word of honesty: some of these tools are still in beta. We're building this out chapter by chapter, and you're seeing it early. If something doesn't work right, or if you see a way to make it better, write to us. We read every message, and founding members have shaped more of this than they know.
>
> *"The fear of the LORD is the beginning of knowledge: but fools despise wisdom and instruction."* — Proverbs 1:7
>
> Grateful to have you with us,
> **OvisCanem**

### 11.2 Purchase Receipt

Separate from the welcome email or combined with it — Robert's call, but the member must receive a clear record of what they bought, for how much, and on what date.

### 11.3 Password Reset

Plain, fast, and it must actually work on mobile email clients. Test it on an iPhone before launch.

### 11.4 Grandfather Notice — To Existing $7 and $24 Members

Short, warm, no action required. Tell them their membership has been upgraded to full lifetime founding membership at no charge, list what they now have, and thank them for being early. **These are the people most likely to give you the testimonials in §12.3 — ask them in this email.**

### 11.5 Phase 2 Emails — Build Later, Plan Now

Renewal reminder, failed-payment notice, cancellation confirmation, and the new-release announcement to lapsed members (§5.5).

### 11.6 Win-Back Email — Automated, Sent at Lockout (Day 15)

Sent automatically the day access is cut. Two doors, no guilt, no pressure. Draft below; Ovis to approve.

> **Subject: The door's still open.**
>
> Friend,
>
> Your membership has lapsed, and your access to the studies has paused. We wanted you to hear that from us directly rather than just run into a locked door.
>
> Anything you already downloaded is still yours — the workbooks, the printed pages, all of it. We don't take back what we've given.
>
> If you'd like to come back, there are two ways:
>
> **[Renew for a year — $57]**
> Full access again, and everything we release this year comes with it.
>
> **[Become a lifetime member — $197]**
> One payment. Never renew again. Everything we ever produce, yours for good.
>
> And if now isn't the time, that's all right too. The Morning App stays free to you, as it is to everyone. Keep starting your day in the word.
>
> *"The fear of the LORD is the beginning of knowledge."* — Proverbs 1:7
>
> The door's open whenever you're ready,
> **OvisCanem**

### 11.7 New Release Announcement — To Lapsed Members

When a new product line launches (§5.5), lapsed members are emailed. Short: here's what's new, here's what it costs to come back, same two doors as above.

---

## 12. Conversion Support Content

### 12.1 Workbook & Curriculum Previews

The trivia and flashcards can be demoed. The workbooks and curriculum cannot — which means the two highest-value items on the includes list are currently invisible to a buyer.

- Three to four page images of an actual workbook, on the home page beneath the demos.
- **Show the fold-in-half print layout.** It's a real differentiator and nobody knows it exists.
- One line of context per image. Let the pages do the selling.
- Same treatment for one curriculum module.

### 12.2 FAQ — Home Page, Below Previews

Expandable questions. Draft answers below; Ovis to approve and correct.

**1. Is this a one-time payment or a subscription?**
Founding membership is a single payment of $37. There is no subscription and no recurring charge. You will never be billed again.

**2. Which Bible translation do you use?**
The King James Bible, exclusively. Every study, workbook, and lesson is built from it.

**3. Do I need to download an app?**
No. Everything works in your web browser, on your phone, tablet, or computer. Sign in and it's there.

**4. Can I print the workbooks?**
Yes. The workbooks are designed to be printed — including a fold-in-half layout made for personal study and family devotions.

**5. What happens when new chapters and workbooks are released?**
As a founding member, everything we release from here forward is included at no additional cost, for life.

**6. Can I use this to teach a class or my family?**
Yes. The teaching curriculum was built for exactly that — home, classroom, or church.

**7. I already paid for a smaller membership. What happens to me?**
You've been upgraded to full founding membership at no charge. Nothing is required from you, and nothing you paid for has been taken away.

**8. What's your refund policy?**
All sales are final. Because access to the full library is delivered immediately at purchase, we do not issue refunds. Please try the free demos first — they're open to everyone, with no signup.

### 12.3 Testimonials

- Two to three short quotes from current members, first name and state.
- Placed between the previews and the FAQ.
- This does the persuasive work the counter would have done, without exposing volume — and it does it better.
- Solicited in the grandfather email (§11.4).

---

## 12A. Social Media & Community

### 12A.1 Footer Social Links

Build a **social bar in the site footer**, present on every page including the gospel page.

| Platform | Status | Link |
|---|---|---|
| **YouTube** | Live | *URL pending from Ovis* |
| **TikTok** | Live | *URL pending from Ovis* |
| **Discord** | **Not yet created** | Slot built, hidden until a link exists |

**Build requirements:**
- Icons only, in the existing color scheme. Small and quiet — this is a footer, not a call to action.
- All links open in a **new tab.** Never navigate a visitor off the site mid-funnel.
- **Links live in an editable config file**, not hard-coded. Ovis or Jared must be able to add the Discord link later without a developer.
- **The Discord slot renders nothing at all until a URL is supplied.** No greyed-out icon, no "coming soon." An empty slot is invisible; a dead icon looks abandoned.

### 12A.2 Discord — Plan Before Launch

The Discord server does not exist yet. It is **not a launch blocker**, and the footer ships without it.

When Ovis creates it:

- **Use a permanent invite link.** Discord's default invite expires after seven days. An expired link in the footer is worse than no link.
- **Seed it before anyone arrives.** A handful of channels and some starting content. Cold TikTok traffic walking into an empty server does more damage than no server at all.
- **Decide public vs. member-only.** Public means anyone from TikTok can join, and it needs moderation. Member-only makes it a membership benefit and stays manageable. **Recommendation: member-only to start**, with the invite delivered in the welcome email rather than the footer. It's easier to open a door later than to close one.
- **Moderation is a real cost.** An unmoderated server carrying a ministry's name will eventually carry something that ministry doesn't want to be associated with. Decide who watches it before it opens.

### 12A.3 Feedback Routing — Discord vs. Email

Ovis wants Discord to handle feedback on bugs, games, and study tools. That works — Robert can post form submissions into a private Discord channel via webhook, which is faster to triage than an inbox.

**But feedback must be split by type. Build both paths:**

| Message type | Destination | Why |
|---|---|---|
| Bug reports, game issues, study-tool feedback | **Discord channel (webhook)** | Fast triage, visible to whoever's helping, easy to thread |
| Gospel page responses — *"I made a decision today," "I'd like to talk to someone"* | **Private email to Ovis only** | **Never a channel.** Someone reaching out about their soul, or in trouble, gets a private reply from a person — not a post next to bug tickets. This one is not negotiable. |
| Billing, refunds, password problems | **Email** | The payment processor requires a support email regardless, and these carry personal and payment details |

**Robert:** the gospel-page path and the billing path must be **email, and must not touch the Discord webhook** — not now, not as a convenience later. Build them as separate routes so the two can never be merged by accident.

**Ovis:** a real monitored email address is still required even with Discord in place (§16.1).

---

## 13. Analytics — Internal Only

None of this is ever displayed to visitors.

1. Home page view
2. CTA click
3. Checkout started / completed / abandoned
4. Each demo: started, completed
5. Share button click, by page and channel
6. Gospel page view, and gospel response-link click
7. Beta feedback submitted
8. Email capture submitted vs. skipped
9. Locked-content click — which chapter or category people try to open. **This tells Ovis what to build next.**
10. Founder count — dashboard only

---

## 14. Technical Requirements

- **Mobile-first.** Most traffic arrives from TikTok on a phone. Design for a 6" screen and scale up.
- **Fast load.** Cold traffic that waits, leaves. Compress images, defer non-critical scripts.
- **Demos run with no account.** Local storage for demo state. No login, no session requirement.
- **Accessibility for the 35+ audience:** minimum 16px body text, large tap targets, high contrast. No thin light-grey type.
- Mobile checkout, including Apple Pay / Google Pay if the processor supports it.
- Preserve existing color scheme, logo, and Hebrews verse (§2).
- **Payment processor chosen for recurring billing capability now**, even though nothing recurs yet (§1, §5.7).
- Workbook PDFs delivered securely to members — not via a public URL that can be shared outside the membership.

---

## 15. Assets Ovis / Jared Must Deliver

| Asset | Owner | For |
|---|---|---|
| Gospel page copy (KJV) | Ovis | §4.3 |
| Statement of Faith — final wording | Ovis | §4.5 |
| Home page headline + offer copy | Ovis | §4.1 |
| Approved "What's Included" wording | Ovis | §4.2 |
| Approved beta notice wording | Ovis | §8 |
| Approved share message copy | Ovis / Jared | §9 |
| Approved FAQ answers | Ovis | §12.2 |
| Approved welcome email copy | Ovis | §11.1 |
| Refund + cancellation policy wording | Ovis | §4.6 |
| Open Graph preview image (1200×630) | Jared | §9 |
| Workbook preview page images | Ovis | §12.1 |
| Member testimonials | Jared | §12.3 |
| Proverbs 1 flashcard content, export-ready | Ovis | Demo 2 |
| Trivia question bank, free categories | Ovis | Demo 3 |
| Full flashcard, workbook, curriculum library | Ovis | Member dashboard |
| Morning App build/handoff | Ovis / Robert | Demo 1 |
| Existing logo and color assets | Robert (on file) | §2 |
| YouTube and TikTok URLs | Ovis | §12A.1 |
| Discord server + permanent invite (post-launch) | Ovis | §12A.2 |
| Trivia banks: The Gospel, Who Jesus Is in the Bible | Ovis | §4.4 |
| Approved win-back email copy | Ovis | §11.6 |

---

## 16. Open Decisions

### 16.1 Needs an Answer Before Build

1. **Which email address** is the monitored inbox for gospel responses, billing, and password problems? Required even with Discord in place (§12A.3).
2. **YouTube URL** (§12A.1).
3. **TikTok URL** (§12A.1).
4. **Is the Discord public or member-only** once it exists? Recommendation: member-only to start (§12A.2). Not a launch blocker.
5. **Question count per free trivia category** — ten is the recommended minimum (§4.4).

### 16.2 Settled — Recorded for Robert

- $37 founding membership is **one-time, lifetime**, capped at 1,000 members, including all future releases.
- Existing $7 and $24 members are **upgraded free** to founding membership, counting against the cap.
- After 1,000: **$57 annual**, plus a **$197 lifetime** option.
- **Founding membership is never reopened.** Future promotions discount the first year of the annual instead.
- Phase 2 toggle is **manual**.
- **No public member counter.**
- New product lines launch annually; active members receive them automatically.
- **Home page verse is Hebrews 13:20–21**, beneath the logo, permanent, and the only Scripture in the site's chrome (§2.1). Other verses elsewhere are allowed with Ovis's approval.
- **Morning App is free forever to everyone**, promoted above the demos on the home page, carrying "Made by OvisCanem" on every screen and every share (§4.1a).
- **Free trivia categories:** The Gospel, Who Jesus Is in the Bible, Is It King James? (§4.4)
- **On lapse:** 14-day grace, then full lockout of everything on the site. Downloaded files are never revoked. Account never deleted. Morning App stays free to them. (§5.5a)
- **Footer social links:** YouTube, TikTok, Discord — Discord slot hidden until it exists (§12A.1).
- **Feedback splits by type:** bugs and games to Discord; gospel responses and billing to private email (§12A.3).

---

## 17. Acceptance Criteria — Definition of Done

- [ ] About page gone, redirected, zero dead links sitewide
- [ ] All tier pricing removed everywhere, including footer and old sales pages
- [ ] No member counter or progress indicator anywhere public
- [ ] $37 offer visible above the fold on a phone with no scrolling
- [ ] "What's Included" live on home page and checkout
- [ ] Color scheme and logo intact; **Hebrews 13:20–21 sits directly beneath the logo, verbatim, on the first screen**
- [ ] Morning App block appears above the demos, works with no signup, carries "Made by OvisCanem," and is shareable
- [ ] Three free trivia categories playable: The Gospel, Who Jesus Is in the Bible, Is It King James?
- [ ] Gospel trivia end screen links to the gospel page
- [ ] Footer social bar live; Discord slot renders nothing while empty; links editable without a developer
- [ ] Feedback routes correctly by type — a gospel-page response reaches private email and **never** appears in Discord
- [ ] Lapse tested end to end: grace period holds access 14 days, lockout works on day 15, account survives, downloaded files untouched, Morning App still reachable, win-back email delivered
- [ ] Gospel page live, second in nav, with a working response link
- [ ] Statement of Faith page live and linked
- [ ] All three demos run with no signup on a phone
- [ ] Beta notice on flashcards and trivia, in both free and member versions
- [ ] Feedback reaches the monitored inbox with tool/chapter/device context attached
- [ ] Share works on iPhone, Android, and desktop; links preview correctly on Facebook and in a text message
- [ ] Email capture appears after demos, is skippable, and never blocks content
- [ ] Refund policy live, linked at footer and checkout, acknowledgment checkbox timestamped
- [ ] Test purchase completes end to end; account auto-created; welcome email delivered; member lands logged in on the dashboard
- [ ] Password reset tested and working on an iPhone
- [ ] Same account verified working on phone, tablet, and desktop
- [ ] Workbook PDFs download for members and are not publicly accessible
- [ ] Existing $7 and $24 members upgraded, access verified intact, grandfather email sent
- [ ] $57 annual and $197 lifetime products exist in the system, hidden, and can be enabled by configuration without code changes

---

## 18. Out of Scope This Round

Blog, community or forum features, additional free chapters beyond Proverbs 1, native mobile apps, and any product line beyond Proverbs.
