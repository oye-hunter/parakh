# 06 · Testing

How to verify the backend yourself — before a checkpoint, before the demo, or after any change.

---

## The three commands

```bash
# 1. Unit tests — signal engine. No network, no database, instant.
pnpm test

# 2. Live AI check — is Groq up and is the model id still valid?
pnpm smoke

# 3. Full API suite — needs the dev server running in another terminal.
pnpm dev             # terminal 1
pnpm test:api        # terminal 2
```

If all three are green, the backend works. **Run all three before you present.**

First time on a machine, provision the officer accounts once:

```bash
pnpm provision:officers
```

---

## Authentication

Officers sign in with email and password (Better Auth). **Applicants do not authenticate** — they are applying *for* an account and have none, so `POST /api/applications` is public. Everything else requires a session.

| Account | Password | Role |
|---|---|---|
| `sana.rehman@parakh.pk` | `parakh-demo-2026` | compliance_officer |
| `faisal.qureshi@parakh.pk` | `parakh-demo-2026` | senior_officer |

Sign-up is **disabled** — a compliance console where anyone can self-register as a reviewer is worse than no auth at all. Accounts come from `pnpm provision:officers`, which is safe to re-run.

```bash
# sign in and keep the cookie
curl -s -c /tmp/cookies.txt -X POST localhost:3000/api/auth/sign-in/email \
  -H 'content-type: application/json' -H 'origin: http://localhost:3000' \
  -d '{"email":"sana.rehman@parakh.pk","password":"parakh-demo-2026"}'

# then use it
curl -s -b /tmp/cookies.txt localhost:3000/api/cases
```

**The `origin` header is not optional.** Better Auth's CSRF protection rejects any cookie-bearing request that arrives without one — `403 MISSING_OR_NULL_ORIGIN`. Browsers send it automatically; curl and bare `fetch` clients must set it themselves. This cost an hour of debugging, so it is written down here.

**`officerId` is never accepted from a request body.** Decision identity comes from the session cookie and nowhere else. Before auth, any caller could attribute an approval to any officer and the audit trail would faithfully record the lie.

---

## 1 · Unit tests — the signal engine

```bash
pnpm --filter @parakh/core test
```

33 tests, ~600ms, no external dependencies. Covers every one of the twelve signals plus the three personas from `03-USE-CASES.md`.

The tests worth understanding:

- **`Kamran is clean`** — a coherent applicant trips nothing. If this fails, the engine is over-flagging and the whole product is worthless.
- **`Bilal trips four signals and scores high`** — the demo's high-risk applicant.
- **`cluster members look clean alone but score high together`** — the differentiator, asserted directly. It checks that `detectSignals(app, [])` returns nothing and `detectSignals(app, ring)` returns two high-severity signals.

Add a test whenever you add a signal. The pattern is at the bottom of `packages/core/src/signals.test.ts`.

---

## 2 · Live AI check

```bash
pnpm --filter @parakh/core smoke
```

Runs two real applicants through Groq and prints the risk level, latency, tripped signals and reasoning. Exits non-zero if either call fell back to the deterministic scorer.

**Run this the morning of the demo.** Groq rotates model availability without notice, and a 404 on `GROQ_MODEL` is the kind of thing you want to discover on Tuesday.

Typical healthy output:

```
Kamran — expect LOW  →  LOW  (confidence 0.95)
model: llama-3.3-70b-versatile · 2528ms
action: auto_approve

Bilal — expect HIGH  →  HIGH  (confidence 0.92)
model: llama-3.3-70b-versatile · 1354ms
```

If you see `⚠️ FALLBACK`, check `GROQ_API_KEY` and `GROQ_MODEL` in `.env`. Valid ids: <https://console.groq.com/docs/models>

---

## 3 · Full API suite

```bash
pnpm --filter @parakh/web dev        # terminal 1, leave running
pnpm --filter @parakh/web test:api   # terminal 2
```

72 assertions against a running server with **real Neon and real Groq — no mocks**. Takes about 20 seconds.

Point it elsewhere with `API_URL=https://your-deploy.vercel.app pnpm test:api`.

### What it covers

| Group | Checks |
|---|---|
| Authentication | Anonymous callers rejected on every officer endpoint · wrong password rejected · **self sign-up disabled** · valid sign-in issues a session · session resolves to the right officer · officer roster not exposed |
| Health | Neon reachable, Groq reachable, model id valid |
| Validation | Malformed body, bad CNIC format, non-JSON, malformed UUID, unknown id — all return JSON, never HTML, never 500 |
| Clean applicant | 201, auto-approved, **and leaks no risk level, reasoning or signals to the applicant** |
| Duplicate | Second submission on the same CNIC within a minute → 409 |
| Contradictory applicant | Scores high, lands in EDD, trips the expected signals, every signal reads ≥2 fields, reasoning has no machine names in it |
| Cross-application | First ring member looks clean; third scores high with both cluster signals; **first member is retroactively re-flagged** |
| Filters | `?risk=`, `?status=`, `?cluster=`, sort order |
| Decisions | Short justification rejected, unknown case 404, valid decision accepted, **attributed to the session officer**, **re-deciding a resolved case rejected**, audit trail snapshots risk + reasoning |
| Dashboard | Volume, queue depth, distribution, clusters, before/after counts move |

The suite creates its own data using CNICs in the `99999-*` range, so it never collides with the seed set.

### Reading a failure

Every failed check prints the assertion and the actual value:

```
✗ scored high  — medium
```

That means the applicant was expected to score `high` and came back `medium`. Start at the signal engine, not the API.

---

## Manual testing with curl

Useful when you want to poke at one thing.

Sign in first (see Authentication above) — everything except `/api/health` and
`POST /api/applications` needs the cookie.

```bash
C="-b /tmp/cookies.txt"

curl -s localhost:3000/api/health | python3 -m json.tool          # public
curl -s $C "localhost:3000/api/cases?status=edd_queue" | python3 -m json.tool
curl -s $C "localhost:3000/api/cases/<case-uuid>" | python3 -m json.tool
curl -s $C localhost:3000/api/officers | python3 -m json.tool     # who am I
curl -s $C localhost:3000/api/dashboard | python3 -m json.tool
```

### Submit an application

```bash
curl -s -X POST localhost:3000/api/applications \
  -H 'content-type: application/json' \
  -d '{
    "cnic":"37405-1234567-1","fullName":"Test User","dob":"1992-05-15","cnicExpiry":"2032-05-15",
    "city":"Lahore","area":"Gulberg","residenceType":"owned","yearsAtAddress":5,
    "employmentType":"salaried","employerName":"Acme","incomeSource":"salary",
    "declaredIncomePkr":150000,"accountPurpose":"personal_use",
    "expectedVolumePkr":90000,"expectedTxnCount":20,"counterparties":"domestic",
    "isPep":false,"existingBankRelationship":true,
    "meta":{"deviceFingerprint":"fp-1","agentPointId":"LHR-041","sessionCity":"Lahore"}
  }' | python3 -m json.tool
```

**To make it score high**, change three fields so they contradict each other:

```
"employmentType":"salaried", "incomeSource":"business"   → source–employment conflict
"declaredIncomePkr":45000, "expectedVolumePkr":400000    → 8.9× income–volume mismatch
"yearsAtAddress":0.2, "existingBankRelationship":false   → address instability
```

**To trigger the cluster**, submit three applications with the same `deviceFingerprint` and `agentPointId`, different CNICs, and similar income and purpose. The first will approve; by the third both cross-application signals fire and the first gets retroactively pulled back into the queue.

### Make a decision

```bash
curl -s -b /tmp/cookies.txt -X POST localhost:3000/api/decisions \
  -H 'content-type: application/json' -H 'origin: http://localhost:3000' \
  -d '{
    "caseId":"<case-uuid>",
    "action":"approve",
    "justification":"Verified the employer directly by phone."
  }' | python3 -m json.tool
```

`action` is `approve` | `reject` | `escalate`. Justification is mandatory and must be at least 10 characters. There is **no `officerId` field** — identity comes from the session.

---

## Resetting

```bash
pnpm db:seed          # wipe and reseed 25 profiles, deterministic scoring
pnpm db:seed --with-ai  # same, but every profile gets real Groq reasoning (~1 min)
```

The seed is a full wipe. Run it before the demo so the dashboard shows clean numbers, and use `--with-ai` if you want the seeded cases to carry model-written explanations rather than placeholder text.

Inspect the data directly with `pnpm db:studio`.

---

## What is deliberately not tested

Worth knowing so nobody is surprised in judging.

- **No email verification or password reset.** Officers are provisioned directly. Fine for a demo; a real deployment needs both.
- **No rate limiting beyond Better Auth's defaults.**
- **No load testing.** Neon's free tier and a hackathon demo do not need it.
- **No mobile app tests.** Not built yet.
- **Groq is not mocked.** The suite makes real inference calls, so it costs tokens and needs a network. That is the trade for testing what actually ships.

---

## Before the demo — the checklist

```bash
pnpm test                 # 33 unit tests
pnpm smoke                # Groq alive, model valid
pnpm db:seed              # clean 25-profile baseline
pnpm provision:officers   # only needed once per database
pnpm dev                  # start server
pnpm test:api             # 72 assertions
pnpm health               # final confirmation
```

Then **load the dashboard once** — a Neon free-tier branch suspends after inactivity and the first query pays a cold start you do not want happening on stage.
