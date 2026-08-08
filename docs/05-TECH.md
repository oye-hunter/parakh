# 05 · Tech

Stack, monorepo layout, and the prompt to scaffold it.

**The project is not initialized yet** — this repo currently contains documentation only. The scaffold prompt is at the bottom of this file.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Monorepo | **pnpm workspaces + Turborepo** | Standard for Next.js + React Native side by side; pnpm's strict linking is what makes Metro behave |
| Backend | **Next.js (App Router) Route Handlers** | API and officer console in one deployable; the AI key stays server-side |
| Database | **Neon** (serverless Postgres) | Branchable, no infra, generous free tier, HTTP driver works from serverless handlers |
| ORM | **Drizzle** | TypeScript-first, schema is the source of truth, `drizzle-kit push` skips migration ceremony |
| Mobile | **React Native via Expo** | EAS Build produces the APK deliverable; Expo Router mirrors the Next.js file convention |
| Mobile styling | **Design tokens + `StyleSheet` primitives** | No NativeWind — see below |
| Web styling | **Tailwind v4** | Web only; `DESIGN.md` already ships a `@theme` block |
| AI | **Google AI Studio (Gemini)** via `@google/generative-ai` | Called only from a Route Handler |
| Charts | `victory-native` (mobile) · `recharts` (web) | |

---

## Layout

```
parakh/
├── apps/
│   ├── web/                  Next.js — officer console + all API routes
│   │   ├── app/
│   │   │   ├── (console)/    dashboard, queue, case detail, history
│   │   │   └── api/
│   │   │       ├── applications/route.ts    POST — submit + score
│   │   │       ├── cases/route.ts           GET  — queue
│   │   │       ├── cases/[id]/route.ts      GET  — case detail
│   │   │       └── decisions/route.ts       POST — approve/reject/escalate
│   │   └── next.config.ts
│   └── mobile/               Expo — applicant flow + officer mobile views
│       ├── app/              Expo Router
│       ├── src/ui/           primitives (Text, Card, Badge, Button, Field)
│       ├── src/theme/        StyleSheet factories built from tokens
│       └── metro.config.js   monorepo-aware — see Gotchas
├── packages/
│   ├── db/                   Drizzle schema + Neon client + seed script
│   ├── core/                 signal engine, risk types, Gemini prompt
│   └── tokens/               design tokens from DESIGN.md, framework-free
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Dependency direction

```
apps/web ────┐
             ├──▶ packages/core ──▶ packages/db
apps/mobile ─┘                 └──▶ packages/tokens
                    apps/mobile ───▶ packages/tokens
```

Packages never import from apps. `core` never imports React. `tokens` imports nothing at all.

### What each package owns

**`packages/db`** — Drizzle schema for all eight tables, the Neon client, and the seed script that generates the 25 applicant profiles. Exports typed query helpers, not raw SQL.

**`packages/core`** — the signal engine (twelve signals, pure functions, unit-tested), the risk-profile Zod schema, and the Gemini prompt builder. **No I/O, no framework, no environment access.** This is the package that justifies the monorepo: it's imported by the web API, tested standalone with `vitest`, and can be pulled into mobile if you ever want on-device pre-checks.

**`packages/tokens`** — a plain TypeScript object mirroring `DESIGN.md`. No CSS, no styled-components, no React. Web turns it into Tailwind `@theme` values; mobile feeds it into `StyleSheet.create`. One source of truth, two consumers, zero shared runtime.

---

## Data flow

```
Mobile app                    Next.js Route Handler              Neon
    │                                  │                           │
    ├── POST /api/applications ───────▶│                           │
    │                                  ├── insert application ────▶│
    │                                  ├── fetch last 24h ────────▶│
    │                                  │                           │
    │                     detectSignals()  ← packages/core, pure   │
    │                                  │                           │
    │                     Gemini ◀─────┤  structured output        │
    │                                  │                           │
    │                                  ├── insert signals ────────▶│
    │                                  ├── insert risk_profile ───▶│
    │                                  ├── insert case ───────────▶│
    │◀───── { reference, status } ─────┤                           │
```

The officer console (`apps/web`) reads the same tables directly through Drizzle — no API hop needed for server components.

---

## Database

### Driver choice

Drizzle offers two Neon drivers and they are **not** interchangeable:

| Driver | Import | Transactions | Use for |
|---|---|---|---|
| HTTP | `drizzle-orm/neon-http` | ❌ single statement only | Reads, single inserts |
| WebSocket | `drizzle-orm/neon-serverless` | ✅ | The decision write |

**The decision write must be transactional** — it updates `cases.status` and inserts a `decisions` row with the risk snapshot, and a half-applied decision corrupts the audit trail. Use the WebSocket driver there. Everything else can use HTTP.

```ts
// packages/db/src/client.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

export const db = drizzle(neon(process.env.DATABASE_URL!));
```

```ts
// packages/db/src/client-tx.ts — only for writes that need a transaction
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

export const dbTx = drizzle(new Pool({ connectionString: process.env.DATABASE_URL! }));
```

### Schema and migrations

Schema lives in `packages/db/src/schema.ts` — the eight tables from `02-ARCHITECTURE.md`.

For a hackathon, **use `drizzle-kit push`**, not generated migrations. It diffs your schema against the database and applies the change directly. Migration files are the right call for production and pure overhead when the schema changes six times a day.

```bash
pnpm --filter @parakh/db push     # apply schema
pnpm --filter @parakh/db seed     # 25 applicant profiles
```

Neon branches are worth knowing about: `main` for the demo data, a `dev` branch to break freely. Resetting is instant and free.

---

## Mobile styling — no NativeWind

NativeWind's main cost is exactly what this repo has: Metro configuration in a monorepo, plus a Babel plugin in the transform chain. Skipping it removes a whole class of "works on my machine" failure.

The replacement is **tokens plus typed primitives**. Three files, no dependencies, no build step.

### 1 · Tokens — framework-free

```ts
// packages/tokens/src/index.ts
export const color = {
  lumenCream:   '#ffffeb',
  ledgerCream:  '#f2efdc',
  lumenStone:   '#e4e4d0',
  vastInk:      '#1a1a1a',
  charcoal:     '#222222',
  fog:          '#8a8a80',
  forestInk:    '#034f46',
  lavender:     '#f0d7ff',
  emberGlow:    '#ffa946',
  riskLow:      '#034f46',
  riskMedium:   '#b06a0c',
  riskHigh:     '#a8322a',
} as const;

export const space  = { xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { tag: 8, row: 12, input: 12, button: 12, card: 24, section: 32, pill: 9999 } as const;
export const font   = {
  display: 'Fraunces_600SemiBold',
  ui:      'Archivo_400Regular',
  uiMed:   'Archivo_500Medium',
  uiSemi:  'Archivo_600SemiBold',
  data:    'JetBrainsMono_400Regular',
  dataMed: 'JetBrainsMono_500Medium',
} as const;
```

### 2 · Text primitives — solves fonts and tabular figures once

```tsx
// apps/mobile/src/ui/Text.tsx
import { Text as RNText, StyleSheet, type TextProps } from 'react-native';
import { color, font } from '@parakh/tokens';

const s = StyleSheet.create({
  title:  { fontFamily: font.display, fontSize: 28, lineHeight: 31, letterSpacing: -0.7, color: color.vastInk },
  body:   { fontFamily: font.ui,      fontSize: 16, lineHeight: 22, color: color.vastInk },
  reason: { fontFamily: font.ui,      fontSize: 16, lineHeight: 26, color: color.vastInk },
  micro:  { fontFamily: font.uiSemi,  fontSize: 11, lineHeight: 13, letterSpacing: 1.1,
            textTransform: 'uppercase', color: color.fog },
  data:   { fontFamily: font.data,    fontSize: 13, lineHeight: 18, color: color.charcoal,
            fontVariant: ['tabular-nums'] },
});

type Variant = keyof typeof s;

export function Text({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <RNText style={[s[variant], style]} {...rest} />;
}
```

Every screen uses `<Text variant="data">` and never touches `fontFamily` again. Getting `tabular-nums` wrong in one place is the kind of thing nobody notices until numbers stop lining up in the queue.

### 3 · Component primitives

Build these once in `apps/mobile/src/ui/`, then compose screens from them:

`Text` · `Card` · `Badge` (risk + status variants) · `Button` (primary / outlined / approve / reject) · `Field` · `EvidenceRow` · `StatTile` · `StepProgress` · `HeaderBand`

That's nine components and it covers all fifteen screens. The design system in `DESIGN.md` specifies each one exactly.

### React Native styling gotchas

- **`lineHeight` is absolute pixels, not a multiplier.** `DESIGN.md` gives ratios — multiply them out. Body 16px at 1.35 → `lineHeight: 22`.
- **`letterSpacing` is pixels, not em.** The micro label's +0.10em at 11px → `letterSpacing: 1.1`.
- **`fontWeight` does nothing when `fontFamily` names a specific weight.** Load `Archivo_600SemiBold` as its own family; don't set `fontWeight: '600'` on `Archivo_400Regular`.
- **`gap` works in modern RN** — use it on flex containers rather than margins on children.
- **Force light mode.** `"userInterfaceStyle": "light"` in `app.json`, or the OS dark setting inverts native inputs and alerts underneath a light-only design.

---

## Environment

| Variable | Where | Notes |
|---|---|---|
| `DATABASE_URL` | `apps/web`, `packages/db` | Neon connection string |
| `GEMINI_API_KEY` | `apps/web` **only** | Never `EXPO_PUBLIC_`, never in mobile |
| `EXPO_PUBLIC_API_URL` | `apps/mobile` | Base URL of the Next.js API |

**`EXPO_PUBLIC_` variables are compiled into the app bundle.** Anything with that prefix is public. The Gemini key never touches the mobile app — mobile posts to `/api/applications` and the Route Handler does the model call.

---

## Local development

```bash
pnpm install
pnpm --filter @parakh/db push
pnpm --filter @parakh/db seed
pnpm dev                              # turbo runs web + mobile together
```

**Mobile cannot reach `localhost`.** On a physical device set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (`http://192.168.x.x:3000`) with both on the same network, or run `npx expo start --tunnel`. On the iOS simulator `localhost` works; on the Android emulator use `http://10.0.2.2:3000`.

---

## Gotchas

**Metro in a monorepo.** The single most common failure. `apps/mobile/metro.config.js` must watch the workspace root and resolve from both `node_modules` folders:

```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
```

**Next.js and workspace packages.** Add `transpilePackages: ['@parakh/core', '@parakh/db', '@parakh/tokens']` to `next.config.ts`. Keeping the packages as raw TypeScript with no build step is the right hackathon trade — Metro handles TS natively and Next transpiles on demand.

**Neon cold starts.** A free-tier database suspends after inactivity and the first query can take a couple of seconds. **Warm it before the demo** by loading the dashboard once.

**Fonts must load before first render.** Use `expo-font` with `SplashScreen.preventAutoHideAsync()`, and load only the six weights in use — full families add several megabytes to the APK for nothing.

**Run one EAS build early in the week.** Signing and credential setup can surprise you, and the APK is a graded deliverable.

---

## Scaffold prompt

The project is empty. Paste this to an agent in this directory to initialize it.

````
Initialize this repository as a pnpm + Turborepo monorepo for a Next.js and React Native
project called Parakh. The repo currently contains documentation only — README.md,
DESIGN.md, and docs/. Read docs/02-ARCHITECTURE.md for the data model and docs/05-TECH.md
for the stack before you start. Do not modify any existing markdown.

Structure:

  apps/web        Next.js, App Router, TypeScript, Tailwind v4, ESLint
  apps/mobile     Expo with Expo Router and TypeScript
  packages/db     Drizzle ORM schema + Neon client + seed script
  packages/core   signal engine and risk types — pure TypeScript, no React, no I/O
  packages/tokens design tokens from DESIGN.md — a plain TypeScript object, no CSS,
                  no framework

Root setup:
  - pnpm-workspace.yaml covering apps/* and packages/*
  - Turborepo with dev, build, lint, and typecheck pipelines
  - TypeScript 5 with a shared tsconfig.base.json; packages stay as raw TypeScript
    with no build step
  - .gitignore, .env.example, .nvmrc
  - Package names: @parakh/web, @parakh/mobile, @parakh/db, @parakh/core, @parakh/tokens

packages/tokens:
  - Export const objects: color, space, radius, font, and a type scale
  - Take every value from DESIGN.md. Do not invent colours or sizes.
  - No dependencies at all

packages/db:
  - drizzle-orm, drizzle-kit, @neondatabase/serverless
  - schema.ts with the eight tables from docs/02-ARCHITECTURE.md: applications,
    application_meta, signals, risk_profiles, cases, decisions, clusters, officers
  - Two clients: neon-http for reads and single writes, neon-serverless for the
    transactional decision write
  - drizzle.config.ts pointing at DATABASE_URL
  - Scripts: "push" running drizzle-kit push, and "seed"
  - seed.ts generating 25 applicant profiles — roughly 15 clean, 5 borderline,
    4 clearly risky, and 4 forming one cluster that share an agent point and device
    fingerprint. The cluster members must each look Low or Medium individually.

packages/core:
  - vitest, zod
  - signals.ts exporting detectSignals(application, recentApplications) returning
    Signal[]. Implement all twelve signals from docs/02-ARCHITECTURE.md, including
    the two cross-application ones. Every signal returns an evidence string
    containing the real figures.
  - risk.ts with the Zod schema for the AI risk profile output
  - prompt.ts building the Gemini prompt from signals plus the raw application
  - signals.test.ts with a test per signal

apps/web:
  - create-next-app defaults: App Router, TypeScript, Tailwind v4, src directory off
  - next.config.ts with transpilePackages for the three workspace packages
  - Tailwind @theme block copied from DESIGN.md
  - @google/generative-ai
  - Route handler stubs only, no logic yet:
      POST /api/applications
      GET  /api/cases
      GET  /api/cases/[id]
      POST /api/decisions
  - Console route group with empty pages: dashboard, queue, case/[id], history

apps/mobile:
  - create-expo-app with the Expo Router TypeScript template
  - Do NOT install NativeWind, tailwindcss, or any CSS-in-JS library. Styling is
    StyleSheet plus @parakh/tokens.
  - expo-font with @expo-google-fonts/fraunces, @expo-google-fonts/archivo,
    @expo-google-fonts/jetbrains-mono — load only Fraunces_600SemiBold,
    Archivo_400Regular, Archivo_500Medium, Archivo_600SemiBold,
    JetBrainsMono_400Regular, JetBrainsMono_500Medium
  - metro.config.js configured for the monorepo: watchFolders set to the workspace
    root, nodeModulesPaths covering both node_modules directories, and
    disableHierarchicalLookup true
  - app.json with userInterfaceStyle set to "light"
  - src/ui/ containing these primitives built from @parakh/tokens, styled with
    StyleSheet.create, following DESIGN.md exactly:
      Text (variants: title, body, reason, micro, data — data uses
            fontVariant tabular-nums)
      Card, Badge (risk and status variants), Button (primary, outlined, approve,
      reject), Field, EvidenceRow, StatTile, StepProgress, HeaderBand
  - Empty route files for the fifteen screens listed in docs/03-USE-CASES.md

Finish by running pnpm install, then pnpm typecheck, and fix anything that fails.
Report what was created and what still needs a human — specifically the Neon
connection string and the Gemini API key.
````

Fill `.env` from `.env.example` after scaffolding: `DATABASE_URL` from the Neon console, `GEMINI_API_KEY` from Google AI Studio, and `EXPO_PUBLIC_API_URL` pointing at your dev machine.
