# 03 · Use Cases

Who uses the system, the three test personas, the nine flows, and the screen inventory.

---

## Actors

| Actor | Who | Where |
|---|---|---|
| **Applicant** | Person opening a digital wallet | Mobile app, usually at an agent shop |
| **Compliance officer** | Reviews flagged cases | Officer console, head office |
| **System** | Runs on every submission | Cross-application pattern detection |

---

## Three personas

These double as the Checkpoint 4 test cases — the brief requires demonstrating the reasoning adapt across low, medium and high profiles.

### Kamran — Low risk
31, shopkeeper in Liaquat Bazaar, Rawalpindi. Declares 85,000/month from business, expects 150,000/month volume, domestic counterparties only, four years at his address, has an existing bank relationship.

Everything lines up. No signals trip. **Auto-approved in seconds.**

*This is the brief's own example applicant. Using his name shows we read it.*

### Bilal — High risk
22. Declares employment type "salaried" but income source "business". 45,000/month income, expects 400,000/month volume with international counterparties. Three months at his address, no existing bank relationship.

Four signals trip: income–volume mismatch at 8.9×, source–employment conflict, cross-border with low income, address instability. **Routed to EDD.**

### The cluster — High risk, only in aggregate
Four applications from agent point RWP-114 within two hours. Same device fingerprint, four different CNICs, near-identical income declarations and account purposes.

**Each one passes on its own.** Individually they read Low or Medium. Only cross-application detection pushes them to High, and it re-flags the ones already sitting in the queue.

This is the persona the demo is built around.

---

## Applicant flows

### UC-1 · Submit an application

**Trigger:** Kamran opens the app at the agent shop.

1. Taps "Get started"
2. **Identity** — CNIC, full name, date of birth, CNIC expiry
3. **Address** — city, area, residence type, years at address
4. **Work & income** — employment type, employer or business name, income source, declared monthly income
5. **Account purpose** — why the account, expected monthly volume, expected transaction count, domestic or international, PEP declaration
6. Reviews a grouped summary of everything entered, edits any section
7. Submits

**Captured silently throughout:** device fingerprint, session location, seconds spent per step, agent point ID.

**System:** signals computed → AI produces risk profile → routing decision.

**Outcome:** *"Application received. Reference TL-4471."* Pending state shown.

**Alternate — missing field:** inline error naming the field and what's wrong (*"CNIC must be 13 digits"*), never a blocking modal, never "Invalid input".

### UC-2 · Check status

**Trigger:** Kamran returns the next day.

1. Enters CNIC or reference number
2. Sees one of: **Under review** / **Approved** / **More information needed** / **Declined**
3. If approved — account is live
4. If more info needed — sees exactly which section to fix, resubmits that section only

**The applicant never sees their risk score, the signals, or the reasoning.** It is internal. Exposing it teaches people to game the form, and a judge from a compliance background will notice if we get this wrong.

---

## Officer flows

### UC-3 · Triage the day

**Trigger:** Officer signs in at 9am.

1. Dashboard: 47 applications today · 31 low, 11 medium, 5 high · 5 in EDD queue · 12 resolved yesterday
2. Scans the volume trend
3. Sees a **cluster alert**: *"4 applications from Agent Point RWP-114 in 2 hours share a device fingerprint"*
4. Taps into the queue

**Outcome:** the officer knows where to spend the morning without opening a single case.

### UC-4 · Review a flagged case

**Trigger:** Officer opens Bilal's case. *This is the screen the demo lives on.*

1. **Applicant summary** — name, CNIC, agent point, submitted 14 minutes ago
2. **Risk badge** — HIGH, confidence `0.87` shown beside it
3. **Contributing signals**, each with real evidence:
   - Income–volume mismatch — `declared 45,000/mo · expects 400,000/mo · 8.9×`
   - Source–employment conflict — `employment "salaried" · income source "business"`
   - Cross-border with low declared income
   - Address instability — `3 months at address · no existing bank relationship`
4. **AI reasoning** in plain language
5. Officer can expand any signal to see the raw declared fields behind it

**Outcome:** a defensible position in under a minute.

### UC-5 · Approve a flagged case

**Trigger:** Officer judges the AI was over-cautious.

1. Taps **Approve**
2. Enters a justification — **required, not optional**
3. Confirms

**Outcome:** case leaves the EDD queue, account activates, decision written to the audit trail with the reasoning **as it stood on screen**. Dashboard counts update immediately — this is the graded **before/after**.

### UC-6 · Escalate

Same shape. Reason selected, notes added. Case moves to escalated state, stays visible, dashboard reflects the move. Used for the cluster case.

### UC-7 · Reject

Same shape. Justification mandatory. Applicant status flips to declined. Audit entry written.

### UC-8 · Review the audit trail

**Trigger:** Officer needs to defend a past decision.

1. Opens decision history
2. Filters by date, officer, or outcome
3. Opens any past case and sees the reasoning **as it stood at decision time**, not recomputed

---

## System flow

### UC-9 · Cross-application pattern detection

**Trigger:** every new submission.

1. Compare against the last 24 hours of applications
2. Check for shared device fingerprints across different CNICs
3. Check for agent-point clustering — volume spike plus profile similarity
4. Check for near-duplicate declarations
5. If a pattern trips, raise risk on **every** application in the cluster and attach a shared reference
6. Surface a cluster alert on the dashboard

This proves "reason across signals, not in isolation" at a level no rule-based checker could reach. Each application passes alone; the fraud is only visible in aggregate.

---

## Screens

Fifteen screens. **Seven need designing in Stitch**; the rest are the same components with different content. Full per-screen detail and paste-ready Stitch prompts are in [`../DESIGN.md`](../DESIGN.md).

| # | Screen | Role | Stitch? |
|---|---|---|:---:|
| A1 | Welcome | Applicant | **yes** |
| A2 | Identity | Applicant | derive |
| A3 | Address | Applicant | derive |
| A4 | Work & Income | Applicant | **yes** — the form pattern |
| A5 | Account Purpose | Applicant | derive |
| A6 | Review & Submit | Applicant | **yes** |
| A7 | Submitted | Applicant | **yes** |
| A8 | Status | Applicant | derive |
| O1 | Sign in | Officer | derive |
| O2 | Dashboard | Officer | **yes** |
| O3 | EDD Queue | Officer | **yes** |
| O4 | Case Detail | Officer | **yes** — design this first |
| O5 | Decision Sheet | Officer | derive |
| O6 | Decision History | Officer | derive |
| O7 | Cluster View | Officer | derive from O3 |

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

**Design order:** O4 → O2 → O3 → A4 → A6 → A7 → A1. O4 is the hardest and the most watched.

**A4 is the pattern screen.** Design it properly once and A2, A3 and A5 are the same layout with different fields — four screens of Stitch time for one screen of work.

---

## Two open decisions

Answer these before O4 gets built:

1. **How many evidence rows show before "show more"?** Currently assumed four to six visible.
2. **Does the officer see the applicant's raw declared fields?** Currently specified as a collapsed accordion on O4, so the source of any signal can be checked without crowding the screen. Alternative is a separate screen.
