# 02 · Architecture

How the system works: the core principle, the risk signals, the data model, and the AI contracts.

---

## The principle everything follows from

**The AI does not compute risk from raw fields. Your code derives cross-field signals; the AI reasons over those signals and writes the judgment.**

Two reasons this split matters.

**Correctness.** Ask a model to eyeball twelve KYC fields and produce a risk score and it will produce something plausible and unrepeatable. Run the same applicant twice and get two answers. On a stage, in front of judges, that is fatal.

**Grading.** The brief demands reasoning "across fields together, not in isolation." Derived signals *are* cross-field by construction — `income_volume_ratio` cannot exist without reading two fields at once. The signal engine makes the requirement structurally true rather than something we hope the model does.

The AI still does real work. It weighs which signals matter in combination, decides the risk level, and writes the explanation an officer reads. That is judgment, and it is exactly what a model is good at.

```
Applicant submits KYC form
        │
        ▼
┌───────────────────────────────┐
│  SIGNAL ENGINE  (TypeScript)  │   pure, tested, no AI
│  · reads this application     │
│  · reads last 24h of others   │
│  → array of tripped signals   │
└───────────────┬───────────────┘
                │  signals + raw fields
                ▼
┌───────────────────────────────┐
│  AI RISK PROFILER  (Gemini)   │   structured output
│  · weighs signals in context  │
│  · assigns Low / Med / High   │
│  · writes the explanation     │
└───────────────┬───────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
   auto-approve      EDD QUEUE
                         │
                         ▼
                  Officer reviews
                  approve / reject / escalate
                         │
                         ▼
                  Audit trail + dashboard updates
```

---

## Risk signals

**This table is the Checkpoint 1 deliverable** — "write down, in plain terms, your risk-scoring logic."

Every signal reads two or more fields. None of them can be produced by validating a single input.

| # | Signal | Reads | Trips when |
|---|--------|-------|-----------|
| 1 | Income–volume mismatch | declared income, expected monthly volume | ratio > 3× |
| 2 | Purpose–employment conflict | employment type, account purpose | e.g. student declaring merchant collection |
| 3 | Source–employment conflict | employment type, income source | e.g. "salaried" with income source "business" |
| 4 | Age–profile implausibility | date of birth, employment type, declared income | e.g. 19-year-old business owner declaring 500k |
| 5 | Address instability | years at address, existing bank relationship | < 6 months **and** no prior banking |
| 6 | Geographic mismatch | session location, declared address | session far from declared city |
| 7 | **Agent-point clustering** | agent point ID, submission time, profile similarity | several similar applications from one agent in a short window |
| 8 | **Device reuse** | device fingerprint, CNIC | same device across different CNICs |
| 9 | Cross-border with low income | counterparties, declared income | international intent, income below threshold |
| 10 | CNIC expiry | CNIC expiry date, today | expired or expiring within 30 days |
| 11 | PEP declaration | PEP flag | self-declared politically exposed |
| 12 | Round-number income | declared income | exact round figure — weak on its own, adds texture in combination |

**Signals 7 and 8 are the differentiators.** They exist only *across* applications, not within one form. Every individual application in a fraud ring can look perfectly reasonable; the pattern is only visible in aggregate. No rule-based form checker can reach this, and the brief's requirement 2 is undeniably satisfied by it.

### Signal engine contract

```ts
type Signal = {
  name: string;              // "income_volume_mismatch"
  label: string;             // "Income–volume mismatch"
  severity: 'low' | 'medium' | 'high';
  evidence: string;          // "declared 45,000/mo · expects 400,000/mo · 8.9×"
  fields: string[];          // which raw fields it read
  clusterRef?: string;       // set for signals 7 and 8
};

function detectSignals(
  application: Application,
  recentApplications: Application[],   // last 24h, for signals 7 & 8
): Signal[];
```

Pure function. No network, no AI, fully unit-testable. **Build and test this before the model is wired up.**

The `evidence` string is not decoration — it renders directly in the officer's evidence row and is what proves "never a silent score." It must always contain real figures, never a restatement of the signal name.

---

## AI risk profiler contract

Gemini, structured output, strict schema.

**Input:** the derived signals, plus the raw application for context.
**Output:**

```json
{
  "risk_level": "low | medium | high",
  "confidence": 0.87,
  "contributing_signals": [
    { "name": "income_volume_mismatch", "weight": 0.34, "evidence": "..." }
  ],
  "reasoning": "The declared salary cannot support the expected transaction volume — the gap is nearly nine-fold. Employment type and income source contradict each other, which usually means one of the two was misdeclared. Combined with cross-border intent and a new address with no banking history, this profile does not hold together.",
  "recommended_action": "auto_approve | manual_review | edd_queue"
}
```

Rules:

- **`reasoning` is written for a human, not a log.** Plain language, no field names, no JSON, no bullet points. It is the paragraph the officer reads and the sentence the judges hear.
- **`contributing_signals` may only reference signals the engine actually produced.** The model ranks and weighs; it does not invent.
- **Snapshot the entire output into the decision record** when the officer decides. Recomputing reasoning on reopen makes the audit trail worthless.

---

## Data model

Neon Postgres, defined in Drizzle. Schema lives in `packages/db/src/schema.ts` — see [`05-TECH.md`](05-TECH.md).

| Table | Key columns | Notes |
|---|---|---|
| `applications` | cnic, full_name, dob, cnic_expiry, city, area, residence_type, years_at_address, employment_type, employer_name, income_source, declared_income_pkr, account_purpose, expected_volume_pkr, expected_txn_count, counterparties, is_pep, existing_bank_relationship | The KYC submission |
| `application_meta` | application_id, device_fingerprint, session_lat, session_lng, agent_point_id, submitted_at, seconds_per_step | Captured silently during the flow — feeds signals 6, 7, 8 |
| `signals` | application_id, name, severity, evidence, fields, cluster_ref | Output of the signal engine |
| `risk_profiles` | application_id, risk_level, confidence, reasoning, contributing_signals, model, created_at | Output of the AI profiler |
| `cases` | application_id, status, assigned_to, queued_at, resolved_at | `pending · edd_queue · approved · declined · escalated` |
| `decisions` | case_id, officer_id, action, justification, risk_snapshot, reasoning_snapshot, decided_at | The audit trail. Snapshots are mandatory. |
| `clusters` | ref, kind, agent_point_id, device_fingerprint, detected_at, application_ids | Cross-application patterns |
| `officers` | name, email, role | |

Two design notes worth defending in the demo:

- **`application_meta` is separate from `applications`** because it is captured silently rather than declared. Keeping it apart makes it obvious which signals come from what the applicant *said* versus what the system *observed*.
- **`decisions` stores snapshots, not foreign keys** to the live risk profile. A compliance audit trail has to show what was known at decision time.

---

## Cross-application detection

Runs on every submission, before the AI profiler.

1. Pull applications from the last 24 hours
2. Group by `device_fingerprint` — flag any fingerprint appearing under more than one CNIC
3. Group by `agent_point_id` — flag volume spikes combined with profile similarity (same employment type, income within a narrow band, same account purpose)
4. If a pattern trips, write a `clusters` row and attach its `ref` to **every** application in the group
5. Raise the severity of all affected applications, not just the newest
6. Surface a cluster alert on the officer dashboard

Point 5 matters: applications already sitting in the queue get re-flagged when a later submission reveals the pattern. That retroactive behaviour is a strong thing to show live.

---

## Stack decisions

Full detail in [`05-TECH.md`](05-TECH.md). In short: pnpm + Turborepo monorepo, **Next.js** Route Handlers for the API and officer console, **Neon** Postgres with **Drizzle**, **React Native** via Expo for mobile, **Gemini** via Google AI Studio. Mobile styling is design tokens plus `StyleSheet` primitives — no NativeWind.

The signal engine lives in `packages/core` as pure TypeScript with no React and no I/O, which is what lets it be unit-tested independently of both apps.

### Security

**The Gemini API key lives only in a Next.js Route Handler.** Mobile posts to `/api/applications`; the handler runs the signal engine and calls Gemini server-side. Never put the key in the mobile app, and never behind an `EXPO_PUBLIC_` prefix — those are compiled into the bundle, and mobile bundles are trivially decompiled.

### Seed data

25 applicant profiles, generated on day one:

- ~15 clean profiles across a realistic spread of employment types and income bands
- ~5 borderline — one or two mild signals, should land Medium
- ~4 clearly risky — several strong contradictions, should land High
- ~4 forming one cluster — same agent point, same device, near-identical declarations, submitted minutes apart

The cluster set overlaps the risky set intentionally: individually those four should each read as Low or Medium, and only the cluster detection should push them to High. That contrast is the demo.
