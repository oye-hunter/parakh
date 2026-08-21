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
| Data fetching & Caching (TanStack Query v5) | ✅ stale-while-revalidate & cross-screen auto-invalidation |
| Mobile app — applicant flow (Expo SDK 57) | ✅ 7 screens (Role choice, DOB/CNIC DatePicker, Auto-dashing CNIC) |
| Mobile app — officer console (Expo SDK 57) | ✅ 4 screens (Floating Centered Decision Modal, EDD Queue, Audit History) |
| Design system | ✅ `DESIGN.md`, 9 primitives, tokens |

**Everything runs on mobile.** The Next.js app is the backend REST API.

---

## Running it

```bash
pnpm install
cp .env.example .env         # fill in DATABASE_URL, GROQ_API_KEY, BETTER_AUTH_SECRET

pnpm db:push                 # create the schema on Neon
pnpm provision:officers      # create the two officer accounts (once)
pnpm db:seed                 # 25 applicant profiles

pnpm dev                                    # API on :3000
pnpm --filter @parakh/mobile start          # Expo SDK 57
```

Sign in as `sana.rehman@parakh.pk` / `parakh-demo-2026`.

### Verify it works

```bash
pnpm test                                   # 33 unit tests — signal engine, no network
pnpm --filter @parakh/mobile typecheck      # TypeScript verification across mobile app
pnpm smoke                                  # is Groq up and is the model id still valid?
pnpm test:api                               # 72 checks against a running server, real Neon + real Groq
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
  mobile/     Expo SDK 57 — applicant flow + officer console (TanStack Query v5)
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
| Mobile Framework | React Native (0.86.2) via Expo SDK 57 (`expo-router`) |
| Data Fetching | TanStack Query v5 (`@tanstack/react-query`) |
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

## Completed Product Features & Enhancements

- **A8 — Application Status Lookup**: Fully implemented at `apps/mobile/app/status.tsx` with auto-dashing CNIC / reference lookup.
- **O6 — Standalone Decision History**: Fully implemented at `apps/mobile/app/officer/history.tsx` with risk badges, decision filters, and justification audit views.
- **Expo SDK 57 & TanStack Query v5**: Fully upgraded to React 19.2.3, React Native 0.86.2, and `@tanstack/react-query` for instant stale-while-revalidate navigation and cross-screen automatic cache invalidation.
- **Tactile Form Fields**: Custom `DatePickerField` with interactive calendar day grid and revolver scroll wheels, plus real-time auto-dashing CNIC inputs (`37405-1234567-1`).
- **Centered Floating Decision Modal**: Redesigned officer confirmation modal floating on center of screen with 3px action-colored borders (`Approve` Forest Ink, `Reject` Brick Alarm, `Escalate` Vast Ink) and multiline justification text field with live character counter.
- **Role Selection Screen**: Clear onboarding entry screen at `app/index.tsx` for Applicant vs Compliance Officer paths.
- **Parakh Warm Ledger Web Landing Page & Console**: Editorial landing page with live interactive risk engine simulator, 4-stage compliance architecture workbench, and Senior Officer web console (`apps/web`).

---

## 📱 Mobile APK Hosting & Distribution

The Parakh web app has a built-in download portal (`/api/download/apk` and QR code scanner). You can host the compiled Android `.apk` in **two ways**:

### Option 1: Local File in Repository (Recommended for Demo & Local Dev)
Place your built `.apk` file in the web app's static downloads directory:
```
apps/web/public/downloads/parakh-v1.0.0.apk
```
*(or simply `apps/web/public/downloads/parakh.apk` or `apps/web/public/parakh.apk`)*

When users scan the QR code or click **"Download APK Direct File"** on the landing page, Next.js will stream the `.apk` directly with correct Android package headers (`application/vnd.android.package-archive`).

### Option 2: External Cloud Storage / Google Drive / GitHub Releases (Recommended for Production)
If your APK is hosted externally (e.g. GitHub Releases, Google Drive, AWS S3, or Cloudflare R2):
1. Open `.env` (or set the environment variable in your production host):
   ```env
   APK_DOWNLOAD_URL="https://github.com/oye-hunter/parakh/releases/download/v1.0.0/parakh-v1.0.0.apk"
   ```
2. The `/api/download/apk` endpoint will automatically redirect (`302`) download requests to your cloud URL.

### How to Build the APK
To compile the Android binary from `apps/mobile`:
```bash
# Generate preview APK using Expo Application Services (EAS)
cd apps/mobile
eas build -p android --profile preview
```
Download the resulting `.apk` from Expo and either drop it into `apps/web/public/downloads/parakh-v1.0.0.apk` or paste the URL into `APK_DOWNLOAD_URL`.

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
