# 04 · Plan

Milestones, checkpoint mapping, deliverables, risks, and the demo script.

---

## Milestones

Ordered so the demo-able surface grows continuously. **M1 and M3 contain no AI at all** and together are roughly half the build — deliberate, so that a broken model layer at hour 40 still leaves a working system.

### M1 · Data foundation

Schema with row-level security. Then **25 seeded applicant profiles** spanning clean, borderline, clearly risky, and one four-application cluster.

Do this on day one. Checkpoint 4 requires testing across low/medium/high profiles, and an empty dashboard looks broken while you're building charts against it.

**Owner:** ______

### M2 · Onboarding flow

Five-step mobile form: identity → address → work & income → account purpose → review & submit. Silently captures device fingerprint, session location, agent point, and per-step timing.

**Owner:** ______

### M3 · Signal engine

Pure TypeScript, unit-tested, no AI. Takes one application plus recent application history, returns tripped signals with real evidence strings. All twelve signals from `02-ARCHITECTURE.md`, including the two cross-application ones.

**Test this independently before wiring the model.** If the signals are wrong, no amount of good prompting saves the output.

**Owner:** ______

### M4 · AI risk profiler

Next.js Route Handler (`POST /api/applications`) holding the Gemini key. Structured output against a strict schema: risk level, confidence, contributing signals with weights, plain-language reasoning, recommended action.

**Owner:** ______

### M5 · Officer console

Dashboard → EDD queue → case detail → decision sheet. Approve / reject / escalate with mandatory justification, writing snapshots to the audit trail. Status changes persist and show as before/after.

**Owner:** ______

### M6 · Dashboard & visualisation

Volume over time, risk distribution bar, queue depth, cases resolved, cluster alert banner. Before/after state changes visible on decision.

**Owner:** ______

---

## Checkpoint mapping

| Their checkpoint | Our work | Where it's documented |
|---|---|---|
| 1 · Planning & Branding | Roles, KYC fields, signal table, brand identity | `01-BRIEF.md`, `02-ARCHITECTURE.md`, `DESIGN.md` |
| 2 · UI/UX & Architecture | Seven Stitch screens + architecture diagram | `DESIGN.md`, diagram to be drawn |
| 3 · Core Build & Simulation | M1–M5 | this document |
| 4 · Testing & Demo Prep | Three personas end to end, README, demo video | `03-USE-CASES.md`, `README.md` |
| 5 · Social Post | LinkedIn post with tags and hashtags | — |

**The architecture diagram is a separate deliverable and nobody has it assigned yet.** It needs to show: onboarding input → storage → AI risk logic → flagging → simulated EDD routing → dashboard output. Draw it in draw.io or Excalidraw and export as an image. Half an hour of work, easy to forget.

**Owner:** ______

---

## Deliverables checklist

| Deliverable | Owner | Status |
|---|---|---|
| Working application — APK, mobile-first | | ☐ |
| GitHub repository | | ☐ |
| Visual architecture diagram (image/PDF) | | ☐ |
| Stitch-designed UI/UX screens | | ☐ |
| Demo video, 3–5 minutes | | ☐ |
| LinkedIn post screenshot | | ☐ |
| README with assumptions, tool usage, mock data | | ☐ |

---

## Risks

### The API key ends up in the app bundle
Mobile bundles are trivially decompiled. The Gemini key lives **only** in a Next.js Route Handler — never in the mobile app, never behind an `EXPO_PUBLIC_` prefix. Verify before shipping, not after.

### The APK build fails late
EAS Build has signing and credential steps that can surprise you. **Run one full build early in the week**, even against a half-finished app. Do not discover this at hour 45.

### The reasoning reads as generic
If the AI's explanation could apply to any applicant, the whole premise collapses. Every reasoning paragraph must cite the actual figures from the evidence strings. Test it by reading three different cases' reasoning side by side — if you can't tell which applicant is which, the prompt needs work.

### Signals fire too often
The brief is explicit that most applicants are legitimate. A system that flags everything is as useless as one that flags nothing. If more than about a third of the seeded profiles land High, the thresholds are wrong.

### Scope
Cut in this order if you fall behind: **decision history → cluster view → dashboard trend chart → escalate action.** The core that must survive: onboarding capture, signal engine, AI profiler, EDD queue, case detail, approve/reject, dashboard counts. That set alone satisfies all six graded requirements.

### Stitch becomes a bottleneck
It's a required checkpoint and it's parallel work. Assign it on day one to whoever is not writing the signal engine.

---

## Demo script

Three minutes. Covers all six graded requirements in order and ends on the thing nobody else built.

| # | Beat | Proves |
|---|---|---|
| 1 | Submit **Kamran** live on the phone — clean profile, five quick steps | Requirement 1 · capture |
| 2 | Approved in seconds, account live | The system doesn't flag everything |
| 3 | Submit **Bilal** — flagged, lands in the EDD queue | Requirement 4 · simulated routing |
| 4 | Officer console: open Bilal's case, walk the four evidence rows with their real figures | Requirement 2 · cross-field reasoning |
| 5 | Read the AI reasoning paragraph aloud | Requirement 3 · never a silent score |
| 6 | Approve with a justification → dashboard counts move on screen | Requirements 5 and 6 · officer decision, before/after |
| 7 | Submit the **four cluster applications** back to back → cluster alert fires, all four flagged together, including ones already in the queue | The differentiator — no rule-based system reaches this |
| 8 | Close on the audit trail showing the snapshotted reasoning | Compliance credibility |

**Write this into a script and rehearse it three times.** Half of hackathon losses are demo failures, not build failures.

Have the seeded data loaded and the app already open on the right screen before you start. Do not do a cold start on stage.

---

## Ground rules

- **Seed data on day one**, not the night before
- **The applicant never sees their risk score or reasoning** — internal only
- **Snapshot AI reasoning into the decision record** — recomputing on reopen makes the audit trail worthless
- **Justification is mandatory** on every officer decision — it's what makes the audit trail defensible
- **Evidence strings always contain real figures** — never a restatement of the signal name
- **Three typefaces maximum, no dark mode** — see `DESIGN.md`
