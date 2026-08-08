# Parakh

**AI-driven customer risk profiling for digital onboarding**

AI Seekho Builders Day 2026 · GDG Islamabad × NIC Islamabad × Mobilink
**Track 2: Kifayat ki Rah — Fintech** (sponsored by Mobilink)

*Parakh* — پرکھ — means appraisal, or judgment.
**Every judgment, explained.**

---

## What it does

Someone opens a digital wallet account at an agent shop. They submit KYC details — CNIC, address, employment, declared income, why they want the account, how much they expect to transact.

A compliance officer at head office sees hundreds of these a day and judges from experience which ones need a closer look. Most applicants are completely legitimate. A small number carry real risk.

**Parakh reads the onboarding fields against each other**, not one at a time, and finds the applications that don't hold together — a declared salary of 45,000 alongside an expected transaction volume of 400,000, or an employment type that contradicts the stated income source. It assigns Low / Medium / High risk with a written reason, routes High-risk cases to an Enhanced Due Diligence queue, and lets the officer approve, reject or escalate with the full reasoning in front of them.

It also catches what **no single form can reveal**: four applications from one agent point in two hours sharing a device fingerprint, each of which looks perfectly ordinary on its own.

### The result that matters

A form with nothing wrong with it — 61,000/mo income against 132,000 expected volume, self-employed with business income, 2.5 years at one address, an existing bank relationship — scored **HIGH, confidence 0.95**, because of what the *other* applications revealed:

> *"This application is part of a cluster of 5 near-identical applications from the same agent point, RWP-114, within a 3-hour window, which strongly suggests a coordinated attempt to create multiple accounts. Furthermore, the device used to onboard this application has been used across 5 different CNICs within 24 hours."*

No rule-based form checker reaches that conclusion.

---

## Status

| Area | State |
|---|---|
| Signal engine (12 cross-field signals) | ✅ 33 unit tests |
| AI risk agent (Groq) with deterministic fallback | ✅ verified live |
| Database + 25 seeded profiles | ✅ Neon + Drizzle |
| REST API (7 endpoints) | ✅ 72 integration checks |
| Officer authentication (Better Auth) | ✅ session-derived identity |
| Mobile app — applicant flow | ✅ 7 screens |
| Mobile app — officer console | ✅ 4 screens |
| Design system | ✅ `DESIGN.md`, 9 primitives |

**Everything runs on mobile.** The Next.js app is the API and has no UI.

---

## Running it

```bash
pnpm install
cp .env.example .env         # fill in DATABASE_URL, GROQ_API_KEY, BETTER_AUTH_SECRET

pnpm db:push                 # create the schema on Neon
pnpm provision:officers      # create the two officer accounts (once)
pnpm db:seed                 # 25 applicant profiles

pnpm dev                                    # API on :3000
pnpm --filter @parakh/mobile start          # Expo
```

Sign in as `sana.rehman@parakh.pk` / `parakh-demo-2026`.

### Verify it works

```bash
pnpm test        # 33 unit tests — signal engine, no network
pnpm smoke       # is Groq up and is the model id still valid?
pnpm test:api    # 72 checks against a running server, real Neon + real Groq
```

Full detail in [`docs/06-TESTING.md`](docs/06-TESTING.md).

---

## How it works

**The AI does not compute risk from raw fields.** A deterministic engine derives cross-field signals in code; the model weighs them in combination, decides the level, and writes the explanation an officer reads.

Two reasons that split matters. **Correctness** — ask a model to eyeball twelve KYC fields and it produces something plausible and unrepeatable, which is fatal on a stage. **Grading** — the brief demands reasoning "across fields together, not in isolation", and derived signals *are* cross-field by construction.

```
Applicant submits KYC form
        │
        ▼
  SIGNAL ENGINE (pure TypeScript, tested)   ← packages/core
   reads this application + last 24h of others
   → array of tripped signals, each with real figures
        │
        ▼
  AI RISK AGENT (Groq, structured output)
   weighs signals · assigns level · writes reasoning
        │
   ┌────┴────┐
   ▼         ▼
auto-approve  EDD QUEUE → officer approves / rejects / escalates
                          → audit trail (risk + reasoning snapshotted)
```

Roughly half the codebase has no AI in it at all. That is deliberate: if the model layer breaks at hour 40, there is still a working system to demo.

---

## Layout

```
apps/
  web/        Next.js — REST API, Better Auth, no UI
  mobile/     Expo — applicant flow + officer console
packages/
  core/       signal engine, Groq agent, prompt (pure TS, no I/O)
  db/         Drizzle schema, Neon clients, seed script
  tokens/     design tokens (no framework, no dependencies)
```

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| API | Next.js App Router Route Handlers |
| Database | Neon serverless Postgres + Drizzle |
| Auth | Better Auth (+ Expo plugin) |
| AI | Groq · `llama-3.3-70b-versatile` |
| Mobile | React Native via Expo Router |
| Mobile styling | Design tokens + `StyleSheet` — no NativeWind |

**The Groq key lives only in a Route Handler.** Never in the mobile app, never behind an `EXPO_PUBLIC_` prefix — those compile into the bundle, and mobile bundles are trivially decompiled.

**Officers authenticate; applicants do not.** `POST /api/applications` is public — an applicant has no account yet, that is the entire point. Every endpoint that reads case data or writes a decision requires a session, and the deciding officer comes from that session, never from the request body.

---

## Documents

| # | Document | What's in it |
|---|---|---|
| 1 | [`docs/01-BRIEF.md`](docs/01-BRIEF.md) | The hackathon, why Track 2, the six graded requirements |
| 2 | [`docs/02-ARCHITECTURE.md`](docs/02-ARCHITECTURE.md) | The 12 signals, data model, AI contracts |
| 3 | [`docs/03-USE-CASES.md`](docs/03-USE-CASES.md) | Personas, nine user flows, screen inventory |
| 4 | [`docs/04-PLAN.md`](docs/04-PLAN.md) | Milestones, deliverables, risks, demo script |
| 5 | [`docs/05-TECH.md`](docs/05-TECH.md) | Stack, monorepo layout, styling approach |
| 6 | [`docs/06-TESTING.md`](docs/06-TESTING.md) | How to test everything yourself |
| 7 | [`DESIGN.md`](DESIGN.md) | Design system — colour, type, 9 components, 15 screens |

---

## What's remaining

### Graded deliverables not yet done

| Item | Notes |
|---|---|
| **APK build** | `eas build -p android --profile preview`. Run one early — signing surprises are real. |
| **Google Stitch screens** | Checkpoint 2 requires them. Paste-ready prompts are at the bottom of `DESIGN.md`. |
| **Architecture diagram** | Checkpoint 2. draw.io or Excalidraw, exported as an image: onboarding → storage → AI logic → flagging → EDD routing → dashboard. |
| **Brand identity** | Checkpoint 1 wants a logo. Palette, type and tagline are settled in `DESIGN.md`; the mark is not drawn. |
| **Demo video** | 3–5 minutes. Script is in `docs/04-PLAN.md`. |
| **LinkedIn post** | Tag GDG Islamabad, NIC Islamabad, Mobilink. Hashtags `#AISeekhoBuildersDay2026 #GDG #NIC #IndependenceDayHackathon`. |

### Product gaps

**A8 — application status lookup.** The screen is a stub. It needs a public, rate-limited endpoint returning a status and nothing else. Deliberately not rushed: a careless version becomes an oracle for probing which declarations pass, which is exactly what an applicant must not learn.

**O6 — standalone decision history.** The audit trail renders inside case detail, which satisfies the graded requirement. A separate filterable view is polish.

**Never run on physical hardware.** Everything is verified through `expo export` and the API suite. The demo path has not been walked on a real Android device, and `EXPO_PUBLIC_API_URL` inference is the most likely thing to need adjusting.

### Before this goes anywhere real

- **Change the officer passwords.** `parakh-demo-2026` is printed in this README.
- No email verification, no password reset.
- Rate limiting is Better Auth's defaults only.
- `packages/core` has 33 tests and the API has 72 integration checks; the mobile app has none.

---

## Notes for whoever picks this up

Four things cost real time and are worth knowing before you touch the build:

**`nodeLinker: hoisted` is load-bearing.** It lives in `pnpm-workspace.yaml`, not `.npmrc` — pnpm 10+ ignores it there, silently. Metro cannot follow pnpm's nested layout, so without it the mobile app will not bundle at all.

**Better Auth needs an `Origin` header** on any cookie-bearing request, or it returns `403 MISSING_OR_NULL_ORIGIN`. Browsers send it automatically; curl, bare `fetch`, and React Native do not.

**Workspace packages use `.js` import extensions** (required by Node ESM and tsx). Both bundlers need `extensionAlias` to map those to `.ts` — see `next.config.ts` and `metro.config.js`.

**`drizzle-kit push` is interactive** when a table disappears and another appears. It hangs in any non-TTY shell.

---

*Educational project built for a hackathon. Not licensed financial or compliance software.*
