# 01 · Brief

The hackathon, the track we chose, and exactly what we're graded on.

---

## The event

**AI Seekho Builders Day 2026** — Independence Day Hackathon
Hosted by GDG Islamabad, NIC Islamabad, and Mobilink.

Five tracks were offered. Each is structurally the same system with different data:

1. **Sehat ki Azaadi — "Outbreak Watch"** · health workers log symptoms, AI spots disease clusters across villages
2. **Kifayat ki Rah — "TrustLens"** · KYC risk profiling at digital onboarding *(sponsored by Mobilink)* ← **our track**
3. **Ilm ki Roshni — "Ustaad's Eye"** · attendance + grades + fees → dropout risk prediction
4. **Sabz Pakistan — "Nikaas"** · citizen flood reports + weather + traffic → coordinated response
5. **Surprise: "Mohalla Mind"** · open-ended neighbourhood intelligence

Every track wants the same five things: fuse two or more genuinely different signals, produce a real judgment rather than a summary, simulate a downstream action, show a before/after, and explain the *why* on every decision. Once you see that, the choice is just which data is easiest to mock convincingly and which demo looks best on a projector.

## Why Track 2

- **Sponsored by Mobilink** — most judge attention, likely the best prize
- **Every input is mock data we generate ourselves.** No weather API, no maps, no external feeds. Zero dependency risk, which is the thing that kills hackathon builds.
- Closest to the team's existing fintech instinct
- The "signals contradict each other" logic is genuinely easy to make impressive — five applicant profiles where the AI catches something a rule-based check would miss

**The trade-off we accepted:** it's a compliance dashboard, so it's the least visually cinematic of the five, and being sponsored means the most competition. We compensate with the cross-application clustering feature (see `02-ARCHITECTURE.md`), which nothing in the brief asks for and which no rule-based system could produce.

---

## The scenario, as written

> At a Mobilink Bank agent point in Liaquat Bazaar, Rawalpindi, a young shopkeeper named Kamran wants to open a digital wallet account so he can start receiving payments from customers online. He fills in his CNIC details, submits his onboarding information, and waits. On the other side, a compliance officer sitting in Islamabad head office is looking at hundreds of onboarding applications a day — each with dozens of fields — trying to judge, mostly from experience and gut feeling, which applications are routine and which ones need a closer look.
>
> Most applicants, like Kamran, are completely legitimate. But hidden among thousands of routine applications are a small number that carry real risk: mismatched information, unusual onboarding patterns, or profiles that just don't add up. Catching those without slowing down or unfairly flagging honest customers is the entire challenge of financial inclusion at scale.

The brief's own framing matters: **most applicants are legitimate.** A system that flags everything is as useless as one that flags nothing. Precision counts as much as recall.

---

## The six requirements

These are the graded functional requirements. Each one must be visibly demonstrated.

### 1 · Capture
Customers submit onboarding / KYC information through a simple flow — identity details, address, income source, employment type, purpose of account, expected transaction behaviour.

### 2 · Build a dynamic risk profile
> "The AI must analyze the onboarding fields **together, not in isolation** — e.g., a mismatch between declared income and expected transaction volume, or inconsistent address/employment signals — to build a holistic risk profile rather than a single rule-based check."

**This is the requirement that decides the grade.** Threshold checks on individual fields will read as form validation.

### 3 · Flag and explain
Risk level (Low / Medium / High) with a clear, human-readable explanation of exactly which signals contributed — *"never a silent score."*

### 4 · Decide and act
High-risk cases must **simulate routing** to an Enhanced Due Diligence (EDD) queue for a compliance officer — not just display a warning.

### 5 · Support the officer's decision
Officers review a flagged case, see the full reasoning trail, and simulate approving, rejecting, or escalating.

### 6 · Visualize
A dashboard showing onboarding volume, risk distribution across applicants, the EDD queue, and how case status changes over time — **before vs after** officer review.

---

## The five checkpoints

| # | Checkpoint | What's required |
|---|---|---|
| 1 | Planning & Branding | User roles defined · KYC fields chosen · **risk-scoring logic written in plain terms** · brand identity (name, tagline, colour palette, logo) |
| 2 | UI/UX & Architecture | **Google Stitch** designs for the customer onboarding flow and the officer review/EDD dashboard · visual architecture diagram (onboarding input → storage → AI risk logic → flagging → EDD routing → dashboard) |
| 3 | Core Build & Simulation | Onboarding capture · AI logic reasoning across signals with explanation · flagging and EDD routing · officer decision simulation |
| 4 | Testing & Demo Prep | End-to-end test across **several applicant profiles (low, medium, high)** showing the reasoning adapt · README with assumptions, tool usage, mock data · 3–5 min demo video |
| 5 | Social Post | LinkedIn post, tag GDG Islamabad + NIC Islamabad + Mobilink, hashtags `#AISeekhoBuildersDay2026 #GDG #NIC #IndependenceDayHackathon` |

Checkpoint 1's "risk-scoring logic written in plain terms" is covered by the signal table in `02-ARCHITECTURE.md`. Checkpoint 4's multi-profile test is covered by the three personas in `03-USE-CASES.md`.

---

## Deliverables

| Deliverable | Status |
|---|---|
| Working application — **APK, mobile-first** | ☐ |
| GitHub repository | ☐ |
| Visual architecture diagram (image/PDF export) | ☐ |
| Stitch-designed UI/UX screens | ☐ |
| Demo video, 3–5 minutes | ☐ |
| LinkedIn post screenshot | ☐ |
| README file | ☐ |

Note: Track 2's deliverable list does **not** include a pitch deck, unlike the other four tracks. Worth building one anyway if there's time, but it isn't graded.

---

## Constraints that are easy to miss

**Google AI Studio, not another provider.** This is a GDG event and multiple tracks name AI Studio explicitly; Track 1's README requirement asks "how AI Studio and Stitch were used." Build on Gemini.

**Google Stitch is a required checkpoint**, not a suggestion. Assign it to someone in parallel with the backend work from day one.

**The APK is graded.** Expo + EAS Build gets there, but run a build early in the week — don't discover a signing problem at hour 45.

**Mobile-first.** The officer console has to work on a phone screen, not just a desktop browser.
