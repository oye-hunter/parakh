# Parakh — Style Reference

> cream ledger, ink rules, one warm serif

**Product:** Parakh (پرکھ — *appraisal, judgment*) — AI-driven customer risk profiling for digital onboarding
**Tagline:** Every judgment, explained.
**Theme:** light only
**Platform:** mobile-first (APK), officer console usable on tablet/desktop

---

Parakh is a **light-only** system. No dark mode, no dark chambers, no inverted sections — a compliance officer reads case after case in an office under fluorescent light, and dark UI is the wrong instrument for that. Everything sits on warm cream paper, and the entire visual hierarchy comes from **three cream tones, 2px ink borders, and one accent** — never from shadow, never from a dark ground.

The two roles are separated by **ground depth**, not by inverting the palette. The applicant flow sits on the lightest cream — open, calm, unintimidating for someone opening their first digital account. The officer console sits one step deeper, so cards lift off it, and carries a single ink header band at the top of each screen: enough weight to feel like a working tool without turning the screen into a cave.

Typography does the heavy lifting. **Fraunces** at semibold gives titles and figures real presence at mobile sizes; **Archivo** handles every interface surface; **JetBrains Mono** carries the figures a compliance officer verifies character by character.

---

## Tokens — Colors

### Brand

| Name | Value | Token | Role |
|------|-------|-------|------|
| Lavender Whisper | `#f0d7ff` | `--color-lavender-whisper` | Primary CTA fill only — the one clickable thing per screen. Never used for risk, status, or data. |
| Forest Ink | `#034f46` | `--color-forest-ink` | Approve action, Low-risk semantic, focus rings |
| Vast Ink | `#1a1a1a` | `--color-vast-ink` | Primary text, all borders, the officer header band |
| Lumen Cream | `#ffffeb` | `--color-lumen-cream` | Applicant ground and all card surfaces |
| Ledger Cream | `#f2efdc` | `--color-ledger-cream` | Officer console ground — one step deeper so cards lift off it |
| Lumen Stone | `#e4e4d0` | `--color-lumen-stone` | Evidence rows, input fill, dividers, inactive step markers |
| Fog | `#8a8a80` | `--color-fog` | Field labels, timestamps, de-emphasized metadata |
| Charcoal | `#222222` | `--color-charcoal` | Secondary text, nav labels |

**Three creams, in order of depth:** Lumen `#ffffeb` → Ledger `#f2efdc` → Stone `#e4e4d0`. That ladder is the entire elevation system. A card is Lumen on Ledger; an evidence row is Stone on Lumen. Nothing else is needed, and nothing casts a shadow.

### Semantic — risk severity

Risk is **state, not decoration**. It is held apart from the brand accent: Lavender never signals risk, and risk colours never fill a normal button.

| Name | Value | Token | Meaning |
|------|-------|-------|---------|
| Clear | `#034f46` | `--risk-low` | Low risk — auto-approve path |
| Ember Deep | `#b06a0c` | `--risk-medium` | Medium — manual review |
| Brick Alarm | `#a8322a` | `--risk-high` | High — routed to EDD queue |

Two changes from the source palette. **Brick Alarm** is new — three risk levels need three distinguishable states and the original palette had no red; it is a desaturated brick that sits with the cream rather than fighting it. **Ember Deep** replaces the original `#ffa946` for text and small fills: the bright amber fails contrast against cream. The bright amber survives in exactly one place:

| Name | Value | Token | Role |
|------|-------|-------|------|
| Ember Glow | `#ffa946` | `--color-ember-glow` | Cluster alert banner fill only — a large surface carrying ink text, never a small label |

### Case status

Status is quieter than risk on purpose. If both shouted, neither would read.

| State | Treatment |
|---|---|
| Pending | Outline pill, 1px Fog border, Fog text |
| In EDD queue | Outline pill, 1px Vast Ink border, Vast Ink text |
| Approved | Filled pill, Forest Ink, cream text |
| Declined | Outline pill, 1.5px Brick Alarm border, Brick Alarm text |
| Escalated | Filled pill, Vast Ink, cream text |

---

## Tokens — Typography

**What changed and why.** The previous pairing was EB Garamond 400 + Figtree. Both were wrong for this product:

- **EB Garamond at weight 400 goes spindly on a phone.** It is a text face cut for print; using it at display sizes in its regular weight works beautifully at 120px on a marketing page and leaves titles looking thin and undernourished at 28px on a 390px screen. The fix is a serif with optical sizing, set heavier.
- **Figtree is pleasant and forgettable.** A fine geometric sans with no opinion, and in a dense console its round, open letterforms cost horizontal space that evidence rows need.

### Fraunces — screen titles and figures
`--font-display` · `Fraunces_600SemiBold` · substitute: Newsreader, Source Serif 4

A variable serif with **optical sizing built in** — exactly the property EB Garamond lacked here. It stays sturdy coming down to 22px instead of thinning out. Warm, slightly squared, with enough character to read as a designed product rather than a default. Set at **weight 600**, not 400: on a phone, presence has to come from weight as well as scale.

Using the static Google Fonts build, take `Fraunces_600SemiBold`. If you wire up the variable font, set `SOFT` to 0 and `WONK` to 0 — the wonk axis adds decorative flourishes that are charming on a bakery site and wrong on a compliance tool.

Used for: screen titles, and single large numerals on stat tiles (`47`, `0.87`). Never for interface labels, never for body copy, never below 22px.

- **Sizes:** 22px, 28px, 32px, 40px
- **Line height:** 1.0–1.2
- **Letter spacing:** −1.0px at 40px, −0.7px at 32px, −0.4px at 22px

### Archivo — every interface surface
`--font-ui` · weights 400, 500, 600, 700 · substitute: Inter, Public Sans

A grotesque built for legibility at small sizes, with slightly narrower letterforms than Figtree — which buys back horizontal room in evidence rows and case cards where every character counts. More spine than Inter without being mannered.

Body copy, form labels, buttons, badges, nav, reasoning paragraphs, evidence rows. 15–16px is the workhorse. Line height 1.35 everywhere except the AI reasoning paragraph, which gets 1.6 because it is genuinely read rather than scanned.

Uppercase micro labels use **Archivo 600 at +0.10em tracking**. `Archivo_Expanded` works well for those labels specifically — optional, and only there.

### JetBrains Mono — figures read character by character
`--font-data` · weights 400, 500 · substitute: IBM Plex Mono, `ui-monospace`

**Added to the source system.** A compliance officer verifies CNIC numbers digit by digit and compares amounts in columns. Proportional type makes that harder and sends the wrong signal — mono reads as *record*, not *prose*. Use for: CNIC, reference codes, currency amounts, ratios, timestamps, device fingerprints, and every numeric column. Always with `font-variant-numeric: tabular-nums`.

- **Sizes:** 12px, 13px, 15px
- **Weights:** 400, 500

### Type Scale — mobile

| Role | Face | Size | Line height | Tracking | Token |
|------|------|------|-------------|----------|-------|
| micro | Archivo 600 | 11px | 1.2 | +0.10em, uppercase | `--text-micro` |
| caption | Archivo 400 | 13px | 1.35 | — | `--text-caption` |
| body-sm | Archivo 400 | 15px | 1.35 | — | `--text-body-sm` |
| body | Archivo 400 | 16px | 1.35 | — | `--text-body` |
| reasoning | Archivo 400 | 16px | 1.6 | — | `--text-reasoning` |
| subheading | Archivo 600 | 18px | 1.3 | — | `--text-subheading` |
| title-sm | Fraunces 600 | 22px | 1.2 | −0.4px | `--text-title-sm` |
| title | Fraunces 600 | 28px | 1.1 | −0.7px | `--text-title` |
| title-lg | Fraunces 600 | 32px | 1.05 | −0.9px | `--text-title-lg` |
| figure | Fraunces 600 | 40px | 1.0 | −1.0px | `--text-figure` |
| data-sm | JetBrains Mono 400 | 13px | 1.4 | — | `--text-data-sm` |
| data | JetBrains Mono 500 | 15px | 1.4 | — | `--text-data` |

**Desktop officer console:** scale `title` → 40px and `figure` → 56px. Everything else holds — interface text does not grow with the viewport.

**Three faces is the ceiling.** Do not add a fourth. If something needs to stand out, change size or weight within these three.

---

## Tokens — Spacing & Shapes

**Base unit:** 8px · **Density:** comfortable in the applicant flow, compact in the officer console

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |
| 64 | 64px | `--spacing-64` |
| 80 | 80px | `--spacing-80` |

### Border Radius

| Element | Value | Note |
|---------|-------|------|
| screen sections | 32px | reduced from the source's 40–80px — oversized radii waste scarce mobile width |
| cards | 24px | |
| evidence rows | 12px | |
| inputs | 12px | |
| buttons | 12px | |
| badges & pills | 9999px | |
| data tags | 8px | tight, deliberate counterpoint |

### Layout

- **Mobile design width:** 390px · content gutter 20px
- **Officer console max-width:** 1080px
- **Card padding:** 20px mobile, 24px desktop
- **Section gap:** 32px mobile, 48px desktop
- **Element gap:** 8–16px
- **Tap target minimum:** 44px

---

## Components

### Risk Badge
**The signature component.** Appears on every case card and at the top of every case detail.

Full pill, 9999px radius. Low: Forest Ink fill, cream text. Medium: Ember Deep fill, cream text. High: Brick Alarm fill, cream text. Padding 6px 14px. Archivo 600, 13px, uppercase, +0.06em tracking. Label reads `LOW` / `MEDIUM` / `HIGH` — never a bare number.

Confidence sits **beside** the badge, never inside it: JetBrains Mono 13px in Fog, formatted `0.87`. Two separate facts, two separate treatments.

### Signal Evidence Row
**The component that wins this project.** Proves "never a silent score."

Container: Lumen Stone fill, 12px radius, 12px 16px padding, stacked with 8px gaps. A 3px severity stripe runs the full height of the left edge in the risk colour.

Three lines:
1. **Signal name** — Archivo 600, 15px, Vast Ink. *"Income–volume mismatch"*
2. **Evidence** — JetBrains Mono 13px, Charcoal. The actual figures. *`declared 45,000/mo · expects 400,000/mo · 8.9×`*
3. **Weight** — Archivo 400, 13px, Fog, right-aligned. *"contributed 34%"*

Tappable to expand the raw fields behind it. The evidence line is what separates this from a debug dump — always real numbers, never a restatement of the signal name.

### Reasoning Panel
The AI's plain-language judgment.

Lumen Cream card, 24px radius, 1.5px Vast Ink border, 20px padding. A `--text-micro` label reads `AI REASONING`. Body in Archivo 400 at 16px with **1.6 line height** — the one place in the system with generous leading, because this paragraph is read rather than scanned. Left-aligned, measure capped at 62 characters. No italics, no quote marks.

### Case Card (queue list item)
Lumen Cream card on Ledger Cream ground, 24px radius, 2px Vast Ink border, 16px padding, 12px gaps between cards.

Row 1: applicant name (Archivo 600, 16px) · risk badge, right-aligned.
Row 2: CNIC in JetBrains Mono 13px Fog.
Row 3: top contributing signal, Archivo 400 13px, truncated to one line.
Row 4: time waiting (JetBrains Mono 12px Fog) · status pill, right-aligned.

Cards carrying a cluster reference swap the left border for 3px Ember Deep.

### Stat Tile
Dashboard summary figures.

Lumen Cream card, 24px radius, 2px ink border, 20px padding. Label above in `--text-micro` Fog. Figure below in **Fraunces 600 at 40px** — the one place the serif does interface work, and what keeps the dashboard from looking like every other admin panel. Optional delta beneath in JetBrains Mono 13px, coloured by risk semantics only when the delta itself is a risk signal.

### Risk Distribution Bar
Horizontal stacked bar, 9999px radius, 14px tall, 2px ink border, segments in the three risk colours with no gaps. Legend beneath: three inline items, each a 10px colour dot plus label plus count in JetBrains Mono. Never a pie chart.

### Cluster Alert Banner
Full-width, Ember Glow `#ffa946` fill, Vast Ink text, 16px radius, 2px ink border, 14px 16px padding. Archivo 600 15px. Text names the specific pattern: *"4 applications from RWP-114 in 2 hours share a device fingerprint."* Tapping opens the filtered queue.

This is the only bright-amber surface in the system, and it appears only when a cross-application pattern trips. Its rarity is what gives it weight — if it were always on screen it would be wallpaper.

### Decision Action Bar
Fixed to the bottom of case detail. Lumen Cream fill, 2px top border in ink, 16px padding, safe-area inset respected.

Three buttons in a row: **Approve** (Forest Ink fill, cream text), **Escalate** (cream fill, 2px ink border, ink text), **Reject** (cream fill, 2px Brick Alarm border, Brick Alarm text). Equal width, 12px radius, 48px tall, Archivo 600 15px.

A deliberate break from the rules: these are the only buttons carrying semantic colour, because the decision *is* the risk judgment. Lavender is wrong here — this is not a call to action, it is a verdict.

### Primary CTA Button
Lavender Whisper fill, Vast Ink text, 2px solid Vast Ink border, 12px radius, 16px 24px padding, Archivo 500 16px. One per screen, maximum. In the applicant flow this is always "Continue" or "Submit".

### Outlined Secondary Button
Lumen Cream fill, Vast Ink text, 2px solid Vast Ink border, 12px radius, 16px 24px padding, Archivo 500 16px.

### Form Field
Label above in `--text-micro`, Fog, uppercase. Input: Lumen Stone fill, 12px radius, 1.5px Vast Ink border, 14px 16px padding, Archivo 400 16px (never below 16px — smaller triggers iOS zoom-on-focus). Focus: border thickens to 2px and shifts to Forest Ink. Helper text beneath in Archivo 400 13px Fog.

Error: border 2px Brick Alarm, message beneath in Brick Alarm 13px. The message names the field and what is wrong — *"CNIC must be 13 digits"* — never "Invalid input".

Numeric and identity fields (CNIC, income, expected volume) set their **input text in JetBrains Mono**, so what the applicant types looks the same as what the officer later reads.

### Step Progress Indicator
Applicant flow header. Five segments, 4px tall, 2px gaps, 9999px radius. Completed: Vast Ink. Current: Forest Ink. Upcoming: Lumen Stone. Step label beneath in `--text-micro`: `STEP 3 OF 5 · WORK & INCOME`. No percentages, no numbers in circles.

### Status Pill
See the case-status table above. Full pill, 5px 12px padding, Archivo 500 12px.

### Audit Trail Entry
Timeline list, 2px Lumen Stone vertical rule down the left, 16px indent. Each entry: timestamp in JetBrains Mono 12px Fog, then action in Archivo 600 15px (*"Approved by S. Rehman"*), then justification in Archivo 400 14px. The **snapshotted** risk badge from decision time sits right-aligned, rendered as an outline pill rather than filled — signalling it is historical, not live.

### Officer Header Band
The one place ink fills a surface. Full-width bar at the top of each officer screen, 64px tall, Vast Ink fill, no radius at the top, 20px radius on the bottom two corners. Contains the screen title in Fraunces 600 22px Lumen Cream, and a single action icon right-aligned in cream.

This is what replaces the dark chamber: a band, not a room. It gives the console a working-tool weight while everything below stays on paper.

### Console Ground
Officer screens sit on **Ledger Cream** `#f2efdc`, one step deeper than the applicant flow's `#ffffeb`. Cards on top are pure Lumen Cream with 2px ink borders, so they read as sheets laid on a desk. Do not use Lumen Cream as the console ground — the cards would vanish into it.

---

## Do's and Don'ts

### Do
- Keep Lavender Whisper for the single primary action per screen — it never touches risk, status, or data
- Set screen titles and stat figures in Fraunces **600**, never 400
- Put every numeral a person verifies — CNIC, amounts, ratios, timestamps — in JetBrains Mono with tabular figures
- Apply 2px solid Vast Ink borders to cards and interactive elements; the thick border is the signature
- Build depth from the three-cream ladder: Lumen → Ledger → Stone
- Give every risk badge a paired confidence value beside it, never inside it
- Show real figures in every evidence row — the number is the evidence
- Give the AI reasoning paragraph 1.6 line height; everything else stays at 1.35
- Snapshot the risk badge and reasoning into the audit trail at decision time
- Put the officer console on Ledger Cream so its cards lift off the ground

### Don't
- Do not build a dark mode, a dark section, or an inverted card — the ink header band is the only filled ink surface
- Do not set Fraunces at weight 400, and do not set it below 22px
- Do not use box-shadow anywhere — separation is border and fill, never elevation
- Do not use bright Ember Glow `#ffa946` for text or small labels; it fails contrast on cream. Use Ember Deep `#b06a0c`.
- Do not introduce a fourth risk colour, a fourth typeface, or repurpose Lavender as a risk state
- Do not colour a status pill and a risk badge the same way in the same row
- Do not show the applicant their risk score or reasoning — it is internal, and exposing it teaches people to game the system
- Do not set form inputs below 16px — iOS zooms on focus and the flow breaks
- Do not centre body text, evidence rows, or reasoning paragraphs
- Do not use a pie chart for risk distribution; the stacked bar is the only permitted form
- Do not use gradients

---

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0a | Lumen Cream | `#ffffeb` | Applicant ground, and every card surface |
| 0b | Ledger Cream | `#f2efdc` | Officer console ground |
| 1 | Stone Inset | `#e4e4d0` | Evidence rows, inputs, dividers |
| 2 | Forest Panel | `#034f46` | Approve action, Low-risk fills |
| 3 | Lavender Accent | `#f0d7ff` | Primary CTA only |
| 4 | Ink Band | `#1a1a1a` | Officer header band only |

## Elevation

Shadowless, and now single-ground. The hierarchy in the officer console runs **Ledger Cream ground → Lumen Cream card → Stone evidence row** — three warm tones, 2px ink borders, no z-axis. Do not add elevation to make a flagged case "pop"; raise its severity stripe instead.

## Imagery

Almost none, deliberately. A compliance tool that decorates itself reads as unserious. Permitted: the wordmark, agent and platform icons at 20px, and flat data marks (distribution bar, sparkline of daily volume, a simple locality dot map for agent clustering). No stock photography, no illustration, no 3D, no abstract gradients. Applicant-uploaded documents render as-is inside a 12px-radius Stone frame with a 1.5px ink border.

One flourish carried over from the source system: a hand-drawn Lavender underline beneath a single word in an onboarding screen title. Use it once in the whole applicant flow, on the first screen only.

## Layout

**Applicant flow** — single column on Lumen Cream, 20px gutters. Step indicator pinned to the top, one field group per screen, primary CTA pinned to the bottom above the safe area. Never more than five fields visible at once. Title in Fraunces 600 28px, left-aligned, with a one-line Archivo subtitle in Fog beneath it. No ink header band here — the applicant flow stays open and unarmoured.

**Officer console** — ink header band at the top, everything below on Ledger Cream. Dashboard opens with a cluster alert banner if one is live, then a 2×2 grid of stat tiles, then the risk distribution bar, then the queue. Queue is a vertical stack of case cards, highest-risk and newest first. Case detail is one scrolling column: applicant summary → risk badge and confidence → evidence rows → reasoning panel → decision action bar fixed at the bottom.

Vertical rhythm: 32px between sections on mobile, 48px on desktop; 12px between evidence rows; 16px between cards.

---

## Screens

Fifteen screens across two roles. **Seven need designing in Stitch**; the rest are the same components with different content and should be built straight from this system — designing four near-identical form screens is wasted time.

| # | Screen | Role | Stitch? | Purpose |
|---|--------|------|:---:|---------|
| A1 | Welcome | Applicant | **yes** | Set expectation, start the flow |
| A2 | Identity | Applicant | derive | CNIC, name, DOB |
| A3 | Address | Applicant | derive | Location and residence stability |
| A4 | Work & Income | Applicant | **yes** | The form pattern for A2/A3/A5 |
| A5 | Account Purpose | Applicant | derive | Intent and expected activity |
| A6 | Review & Submit | Applicant | **yes** | Confirm everything before submission |
| A7 | Submitted | Applicant | **yes** | Reference number, pending state |
| A8 | Status | Applicant | derive | Approved / more info / declined |
| O1 | Sign in | Officer | derive | Officer authentication |
| O2 | Dashboard | Officer | **yes** | Triage the day |
| O3 | EDD Queue | Officer | **yes** | List of flagged cases |
| O4 | Case Detail | Officer | **yes** | Review reasoning, decide |
| O5 | Decision Sheet | Officer | derive | Justification before committing |
| O6 | Decision History | Officer | derive | Audit trail |
| O7 | Cluster View | Officer | derive | O3 filtered to one cluster |

### Navigation

```
APPLICANT                          OFFICER
A1 Welcome                         O1 Sign in
 └─ A2 Identity                     └─ O2 Dashboard
     └─ A3 Address                      ├─ O3 EDD Queue ──┐
         └─ A4 Work & Income            │                 ├─ O4 Case Detail
             └─ A5 Purpose              ├─ O7 Cluster ────┘      └─ O5 Decision Sheet
                 └─ A6 Review           └─ O6 Decision History
                     └─ A7 Submitted
                         └─ A8 Status
```

---

### A1 · Welcome
Lumen Cream ground, no header band. Fraunces 600 28px title — *"Open your account in five steps"* — with the single Lavender hand-drawn underline under one word. This is the only place that flourish appears in the whole product. Archivo subtitle in Fog beneath. Three short trust lines with 20px icons. Primary CTA pinned at the bottom: **Get started**.

### A2 · Identity — *derive from A4*
Step 1 of 5. Fields: CNIC (JetBrains Mono, formatted `00000-0000000-0`), Full name, Date of birth, CNIC expiry date.

### A3 · Address — *derive from A4*
Step 2 of 5. Fields: City, Area or locality, Residence type (owned / rented / family), Years at this address.

### A4 · Work & Income
Step 3 of 5 — **design this one and the other three form screens follow it exactly.** Step progress bar at top, third segment Forest Ink, micro label `STEP 3 OF 5 · WORK & INCOME`. Fraunces title, one-line Archivo subtitle in Fog. Four fields: Employment type (select), Employer or business name, Income source (select), Declared monthly income (JetBrains Mono, PKR). Primary CTA **Continue** pinned bottom.

Never more than five fields on one screen. If a group needs six, split it.

### A5 · Account Purpose — *derive from A4*
Step 4 of 5. Fields: Purpose of account (select), Expected monthly volume (mono, PKR), Expected transactions per month, Counterparties (domestic / international), PEP declaration (toggle).

### A6 · Review & Submit
Step 5 of 5. Four grouped summary cards — Identity, Address, Work & Income, Purpose — each a Lumen Cream card with a 2px ink border, values in the same faces they were entered in (mono stays mono), and a small **Edit** text link top-right that returns to that step. Consent checkbox beneath. Primary CTA **Submit application**.

### A7 · Submitted
Confirmation. Fraunces title *"Application received"*. Reference number large in JetBrains Mono 15px inside a Stone tag. Status pill reading **Pending**. One Archivo line explaining what happens next and roughly how long. Secondary outlined button: **Check status**.

### A8 · Status — *derive from A7*
Same layout, three variants driven by state.
**Approved** — Forest Ink filled pill, *"Your account is live"*, primary CTA continues into the wallet.
**More information needed** — names the exact section to fix and nothing else; CTA jumps straight to that step.
**Declined** — Brick Alarm outline pill, neutral one-line copy, no CTA.

All three show **only the outcome**. The applicant never sees a risk score, a signal list, or the reasoning — that is internal, and exposing it teaches people to game the form.

### O1 · Sign in — *derive*
Ledger Cream ground, wordmark, two fields, primary CTA. Lowest design priority in the product.

### O2 · Dashboard
Ink header band: **Dashboard**. On Ledger Cream below it, in order:
1. Cluster alert banner — only when a cross-application pattern is live
2. 2×2 grid of stat tiles: *Applications today · In EDD queue · Approved today · Avg decision time*
3. Risk distribution bar with dot legend
4. **Needs review** — the top three case cards, with a text link to the full queue

### O3 · EDD Queue
Ink header band: **EDD Queue**, filter icon right. Filter chips beneath: *All · High · Medium · Clustered*. Then a vertical stack of case cards, sorted highest risk first and longest waiting within that. Cluster-linked cards carry the Ember Deep left border.

Empty state: a Stone card, one Archivo line — *"Nothing in the queue. 31 applications cleared automatically today."* Never an illustration.

### O4 · Case Detail
**The screen this project is judged on.** Ink header band with a back chevron and the case reference in mono. On Ledger Cream:
1. Applicant summary card — name, CNIC in mono, agent point, time since submission
2. Risk badge with confidence beside it
3. Evidence rows — four to six, severity-striped, each showing real figures
4. Reasoning panel
5. **Applicant declaration** — collapsed accordion holding the raw submitted fields, so the officer can check the source of any signal
6. Decision action bar fixed to the bottom

### O5 · Decision Sheet — *derive*
Bottom sheet over O4, Lumen Cream, 32px top corners, 2px ink border. Title states the action — *"Approve this application?"*. Justification textarea, **required**. Confirm button coloured to match the action; Cancel as a ghost. Committing writes to the audit trail and returns to O3 with the case removed.

### O6 · Decision History — *derive*
Ink header band: **Decision history**. Filter row: date, officer, outcome. Timeline of audit trail entries. Each entry's risk badge is the snapshot from decision time, rendered as an outline pill.

### O7 · Cluster View — *derive from O3*
O3 with a cluster filter applied and the alert banner pinned above the list, so all applications sharing a cluster reference are visible together. This is the screen that proves cross-application reasoning — worth 15 seconds of the demo.

### Build order

Design **O4 first** — it is the hardest and the most watched. Then O2, O3, A4, A6, A7, A1. Everything marked *derive* is built in code from components already specified above.

---

## Agent Prompt Guide

**Quick reference**
- applicant ground `#ffffeb` · officer ground `#f2efdc` · cards `#ffffeb` · insets `#e4e4d0`
- text `#1a1a1a` · borders 2px `#1a1a1a` · muted `#8a8a80`
- primary action `#f0d7ff` fill, ink text, 2px ink border
- risk: low `#034f46` · medium `#b06a0c` · high `#a8322a`
- titles Fraunces 600 · interface Archivo · figures JetBrains Mono
- **no dark mode, no shadows, no gradients**

**Stitch prompt — case detail (generate this one first)**

> Mobile compliance review screen on a warm off-white background (#f2efdc). A black header band across the top with the screen title in a semibold serif, cream text. Below on the warm ground: a cream card with a thick 2px black border showing the applicant name in semibold sans and CNIC underneath in monospace grey. Then a large pill badge reading "HIGH" filled deep brick red with cream text, and the value "0.87" in monospace grey beside it. Below that, four stacked evidence rows on pale stone cards with 12px rounded corners, each with a 3px coloured stripe on the left edge — every row shows a signal name in bold sans, then the actual figures in monospace underneath, then a small grey percentage right-aligned. Beneath those, a cream card with a thin black border, a tiny uppercase label "AI REASONING", and a paragraph of plain-language explanation with generous line spacing. Fixed at the bottom: three equal-width buttons — Approve filled deep teal, Escalate outlined black, Reject outlined brick red. Flat, no shadows, no dark mode, thick black borders throughout.

**Stitch prompt — officer dashboard**

> Mobile dashboard on a warm off-white background (#f2efdc) with a black header band at the top. Below it, an amber alert banner with a thick black border and a specific warning sentence in bold sans. Then a 2×2 grid of cream cards with 24px rounded corners and 2px black borders, each showing a tiny uppercase grey label and a large semibold serif number. Beneath, a horizontal stacked bar with fully rounded ends and a black border, split into teal, amber and brick-red segments, with a legend of small coloured dots and monospace counts. Then a vertical list of case cards — name in bold sans, coloured risk pill on the right, CNIC in monospace grey, one line of signal text, and time waiting. Flat, warm, no shadows, no dark mode.

**Stitch prompt — applicant onboarding**

> Mobile form screen on a warm cream background (#ffffeb). A five-segment progress bar at the top with the third segment filled deep teal, and a tiny uppercase label "STEP 3 OF 5 · WORK & INCOME". A left-aligned semibold serif heading and one line of grey sans subtitle. Four form fields with pale stone fill, 12px rounded corners, thin black borders, and tiny uppercase grey labels above each — the numeric fields use monospace text. A soft lavender button with a 2px black border pinned at the bottom reading "Continue". Calm, open, generous spacing, flat, no shadows, no dark mode.

**Stitch prompt — O3 EDD queue**

> Mobile list screen on a warm off-white background (#f2efdc) with a black header band at the top reading "EDD Queue" in semibold serif cream text, a filter icon on the right. Below, a row of small rounded filter chips: All, High, Medium, Clustered — the first one filled black with cream text, the rest outlined. Then a vertical stack of cream cards with 24px rounded corners and 2px black borders, 12px apart. Each card: applicant name in bold sans on the left with a coloured risk pill on the right, a CNIC in monospace grey below, one truncated line of signal text, and at the bottom a small monospace waiting time on the left with an outlined status pill on the right. One card has a thick amber stripe down its left edge. Flat, warm, no shadows, no dark mode.

**Stitch prompt — A1 welcome**

> Mobile welcome screen on a warm cream background (#ffffeb). Small wordmark at the top left. A large left-aligned semibold serif headline reading "Open your account in five steps", with a hand-drawn soft lavender squiggle underline beneath the word "five". One line of grey sans subtitle below. Then three short rows, each with a small black line icon and a single line of sans text. Generous empty space in the middle. A soft lavender button with a 2px black border pinned near the bottom reading "Get started". Calm, editorial, flat, no shadows, no dark mode.

**Stitch prompt — A6 review & submit**

> Mobile review screen on a warm cream background (#ffffeb). Five-segment progress bar at top, all segments filled black, tiny uppercase label "STEP 5 OF 5 · REVIEW". Semibold serif heading "Check your details". Below, four stacked cream cards with 24px rounded corners and 2px black borders, each with a tiny uppercase grey section label, a small "Edit" text link in the top right corner, and three or four label-value rows inside — values in sans, but numbers and ID codes in monospace. A checkbox row with one line of small grey consent text beneath the cards. A soft lavender button with a 2px black border pinned at the bottom reading "Submit application". Flat, no shadows, no dark mode.

**Stitch prompt — A7 submitted**

> Mobile confirmation screen on a warm cream background (#ffffeb). Centred black line-art checkmark icon inside a thin circle. Below it, a left-aligned semibold serif heading "Application received". Then a pale stone tag with rounded corners containing a reference code in monospace. An outlined pill reading "Pending" with a grey border and grey text. One or two lines of grey sans text explaining what happens next. A cream button with a 2px black border near the bottom reading "Check status". Lots of empty space, calm, flat, no shadows, no dark mode.

---

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Brand */
  --color-lavender-whisper: #f0d7ff;
  --color-forest-ink: #034f46;
  --color-vast-ink: #1a1a1a;
  --color-lumen-cream: #ffffeb;
  --color-ledger-cream: #f2efdc;
  --color-lumen-stone: #e4e4d0;
  --color-fog: #8a8a80;
  --color-charcoal: #222222;
  --color-ember-glow: #ffa946;

  /* Semantic — risk */
  --risk-low: #034f46;
  --risk-medium: #b06a0c;
  --risk-high: #a8322a;

  /* Surfaces */
  --surface-applicant: #ffffeb;
  --surface-console: #f2efdc;
  --surface-card: #ffffeb;
  --surface-inset: #e4e4d0;
  --surface-band: #1a1a1a;

  /* Typography — families */
  --font-display: 'Fraunces', 'Newsreader', Georgia, serif;
  --font-ui: 'Archivo', 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-data: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

  /* Typography — scale (mobile) */
  --text-micro: 11px;      --leading-micro: 1.2;      --tracking-micro: 0.10em;
  --text-caption: 13px;    --leading-caption: 1.35;
  --text-body-sm: 15px;    --leading-body-sm: 1.35;
  --text-body: 16px;       --leading-body: 1.35;
  --text-reasoning: 16px;  --leading-reasoning: 1.6;
  --text-subheading: 18px; --leading-subheading: 1.3;
  --text-title-sm: 22px;   --leading-title-sm: 1.2;   --tracking-title-sm: -0.4px;
  --text-title: 28px;      --leading-title: 1.1;      --tracking-title: -0.7px;
  --text-title-lg: 32px;   --leading-title-lg: 1.05;  --tracking-title-lg: -0.9px;
  --text-figure: 40px;     --leading-figure: 1.0;     --tracking-figure: -1.0px;
  --text-data-sm: 13px;    --leading-data-sm: 1.4;
  --text-data: 15px;       --leading-data: 1.4;

  /* Weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-display: 600;   /* Fraunces — never 400 */

  /* Spacing */
  --spacing-4: 4px;   --spacing-8: 8px;   --spacing-12: 12px;
  --spacing-16: 16px; --spacing-24: 24px; --spacing-32: 32px;
  --spacing-40: 40px; --spacing-48: 48px; --spacing-64: 64px;
  --spacing-80: 80px;

  /* Radius */
  --radius-tag: 8px;
  --radius-row: 12px;
  --radius-input: 12px;
  --radius-button: 12px;
  --radius-card: 24px;
  --radius-section: 32px;
  --radius-pill: 9999px;

  /* Layout */
  --gutter: 20px;
  --console-max-width: 1080px;
  --card-padding: 20px;
  --section-gap: 32px;
  --tap-target-min: 44px;
  --header-band-height: 64px;

  /* Borders */
  --border-heavy: 2px solid var(--color-vast-ink);
  --border-field: 1.5px solid var(--color-vast-ink);
}
```

### Tailwind v4

```css
@theme {
  --color-lavender-whisper: #f0d7ff;
  --color-forest-ink: #034f46;
  --color-vast-ink: #1a1a1a;
  --color-lumen-cream: #ffffeb;
  --color-ledger-cream: #f2efdc;
  --color-lumen-stone: #e4e4d0;
  --color-fog: #8a8a80;
  --color-charcoal: #222222;
  --color-ember-glow: #ffa946;

  --color-risk-low: #034f46;
  --color-risk-medium: #b06a0c;
  --color-risk-high: #a8322a;

  --font-display: 'Fraunces', 'Newsreader', Georgia, serif;
  --font-ui: 'Archivo', 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-data: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

  --text-micro: 11px;
  --text-caption: 13px;
  --text-body-sm: 15px;
  --text-body: 16px;
  --text-subheading: 18px;
  --text-title-sm: 22px;
  --text-title: 28px;
  --text-title-lg: 32px;
  --text-figure: 40px;

  --spacing-4: 4px;
  --spacing-12: 12px;

  --radius-tag: 8px;
  --radius-row: 12px;
  --radius-card: 24px;
  --radius-section: 32px;
}
```

### Expo / React Native notes

Install the three faces:

```bash
npx expo install expo-font \
  @expo-google-fonts/fraunces \
  @expo-google-fonts/archivo \
  @expo-google-fonts/jetbrains-mono
```

Load only the weights in use — `Fraunces_600SemiBold`, `Archivo_400Regular`, `Archivo_500Medium`, `Archivo_600SemiBold`, `JetBrainsMono_400Regular`, `JetBrainsMono_500Medium`. Six files keeps the APK small; loading full families adds several megabytes for nothing.

**Styling is `StyleSheet` plus `@parakh/tokens` — no NativeWind, no CSS-in-JS.** Every value on this page lives in the tokens package; screens compose the primitives in `apps/mobile/src/ui/`. See [`docs/05-TECH.md`](docs/05-TECH.md) for the pattern.

Four things that do not translate directly from this spec to React Native:

- **`lineHeight` is absolute pixels, not a multiplier.** The ratios above must be multiplied out — body 16px at 1.35 becomes `lineHeight: 22`.
- **`letterSpacing` is pixels, not em.** The micro label's +0.10em at 11px becomes `letterSpacing: 1.1`.
- **`fontWeight` is ignored when `fontFamily` names a specific weight.** Load `Archivo_600SemiBold` as its own family rather than setting `fontWeight: '600'` on the regular cut.
- **`tabular-nums`** needs `fontVariant: ['tabular-nums']` in the style object. Put it in the `data` variant of the `Text` primitive once, not on every numeric string.

`box-shadow` is unused, so there is nothing to port — and since the system is light-only there is no `useColorScheme` branching either. Set `"userInterfaceStyle": "light"` in `app.json` so the OS dark setting cannot invert native inputs and alerts.
