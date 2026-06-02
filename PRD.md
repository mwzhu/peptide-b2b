# Beacon — Product Requirements Document

**Product:** Beacon — a peptide program platform for medspas and health clinics
**Status:** Draft v1
**Last updated:** 2026-05-19

---

## 1. Product Positioning

Beacon is a two-sided platform for medspas and health clinics that prescribe, dispense, or
coordinate peptide protocols. It is **not** a generic "MyFitnessPal for peptides" — it is a
lightweight operating system for running a peptide program: better adherence, safer
monitoring, faster refills, stronger documentation, and outcomes data the clinic can sell on.

- **Patients** follow their protocol, reconstitute and dose correctly, log symptoms and
  progress, request refills, and message their care team.
- **Clinics** build protocols, monitor adherence and outcomes, triage side effects, manage
  inventory and commerce, and document everything.
- **The integration layer** keeps both sides synced in real time around a shared set of
  clinical objects.

### Guardrail (non-negotiable)

Beacon never independently recommends peptides, doses, or protocol changes. Every clinical
parameter is configured or approved by licensed clinic staff. The app is an adherence,
monitoring, and operations tool — not a source of medical advice.

---

## 2. The Moat: Peptide-Specific vs. Generic Features

Most of this PRD describes a capable chronic-care platform. What makes Beacon defensible —
and genuinely a *peptide* product — is a small set of features tied to how peptides actually
work. **These are MVP-tier, not V2.** Every feature below is tagged:

- 🔬 **Peptide-specific** — the moat. Build these first and best.
- ⚙️ **Generic care platform** — table stakes, but necessary.

If you stripped the 🔬 features out, ~80% of this scope would be a generic care app. Invest
accordingly.

### Why peptides are different

Peptides ship as **lyophilized powder**. Before the first injection the patient must:

1. Reconstitute the vial — mix in a measured volume of bacteriostatic water.
2. Convert a prescribed mg/mcg dose into **insulin-syringe units** (how far to draw the
   plunger).
3. Track the **beyond-use date (BUD)** — a reconstituted vial expires in days/weeks and must
   be discarded.

This math is the #1 source of patient anxiety and dosing error in real-world peptide use.
Getting it right is the product.

---

## 3. User Types

| Role | Description |
|------|-------------|
| **Patient** | Uses the mobile app to follow a protocol, reconstitute and dose, log symptoms/progress, upload labs/photos, request refills, message the clinic. |
| **Provider** | Physician, NP, PA, RN, or health coach managing patient plans, adherence, triage, outcomes, and follow-up. |
| **Clinic Admin** | Manages clinic settings, providers, products, inventory, permissions, billing, and reporting. |
| **Pharmacy / Dispensing Partner** *(optional)* | Receives fulfillment requests, updates lot/shipment info, supports refill workflows. |

---

## 4. Patient App

### 4.1 Onboarding ⚙️
Guided and clinical, not a habit-tracker vibe.

- Invite-based clinic onboarding (link/code ties every patient to a clinic).
- Account creation, identity basics, DOB.
- Consent forms, clinic policies, e-signature capture.
- Medical history intake; current medications and allergies.
- Goals: weight loss, recovery, sleep, libido, performance, skin, inflammation, wellness.
- Baseline metrics: weight, measurements, photos, symptoms, energy, sleep, mood, appetite,
  pain, lab values.
- "My care team" view with provider names and contact rules.

### 4.2 Treatment Plan View ⚙️
The heart of the patient experience.

- Active peptide protocol(s): name, route (injection / oral / nasal / topical), dose
  instructions, frequency, start/end dates.
- 🔬 **Titration schedules** — auto-advancing dose ramps (critical for GLP-1s such as
  semaglutide/tirzepatide); app shows "Week 3: increase to X."
- 🔬 **Cycle tracking** — on/off cycles (e.g., 5-on/2-off, 8-week cycles), cycle-day counter,
  rest periods.
- 🔬 **Stacked protocols** — multiple peptides at once, each with its own schedule.
- Storage and handling instructions per peptide.
- Safety instructions; missed-dose instructions authored by the clinic.
- Clinic-attached education, "what to expect" timeline, provider-approved FAQs.

### 4.3 🔬 Reconstitution Calculator — *signature feature*
The single most important peptide-specific feature.

- Input: vial peptide amount (mg), bacteriostatic water volume added (mL), prescribed dose
  (mg/mcg).
- Output: exact volume to draw, shown in **insulin-syringe units** with a visual syringe
  graphic (plunger marked to the correct line).
- Provider can **pre-fill** reconstitution parameters so the patient never guesses the math.
- Saved per vial — the calculation isn't redone every injection.
- First-class **unit conversion** model: mg ↔ mcg ↔ IU ↔ syringe units.
- Doses-per-vial estimate and supply projection.
- Step-by-step reconstitution walkthrough for the first vial.

### 4.4 🔬 Vial & Supply Management
- Active-vial tracking: reconstitution date, parameters, doses drawn, doses remaining.
- **Beyond-use date (BUD) alerts** — "this vial expires in 3 days / discard this vial."
- Supply-remaining projection feeding refill timing ("you have ~6 doses / 9 days left").
- Storage state reminders (refrigerate after reconstitution, protect from light).

### 4.5 Dose Tracking ⚙️ / 🔬
Make adherence easy and auditable.

- Dose and injection reminders (push, SMS, email).
- "Mark as taken" with dose amount, time, and route confirmation.
- 🔬 **Injection site rotation tracker** — body-map picker, suggests next site, warns on
  overuse of one area.
- Missed-dose logging with reason and clinic-authored guidance on late doses.
- Post-dose side-effect prompt.
- Optional photo proof / vial scan (clinic-configurable).
- Calendar view of completed and upcoming doses.
- Adherence streaks — present maturely, not childishly gamified.

### 4.6 Side Effect & Symptom Tracking ⚙️
Lightweight but clinically useful.

- Quick daily check-in; custom symptom scales per protocol.
- Side-effect logging: nausea, headache, injection-site reaction, fatigue, appetite/mood/
  sleep changes, pain, plus custom clinic-defined symptoms.
- Severity scale, duration, notes.
- Red-flag symptom guidance configured by the clinic.
- "Contact clinic" escalation prompts; structured follow-up questions.
- Provider-visible trend charts.

### 4.7 Outcomes Tracking ⚙️
Patients want to see progress; clinics want proof of value.

- Trends: weight, body composition, measurements, sleep, energy, mood, appetite/cravings,
  pain/inflammation.
- Progress photos with private gallery and before/after comparison.
- Workout/recovery notes; lab trends; goal-progress dashboard.
- Provider-generated progress summaries.
- Optional wearable integration (Apple Health / Google Health Connect / Oura / Whoop).

### 4.8 Labs & Documents ⚙️
- Upload lab PDFs/images; manual lab value entry.
- Clinic-requested lab checklist; lab-due reminders.
- Lab trend visualization; provider comments.
- Secure document storage: prescriptions, consent forms, care plans, visit summaries,
  injection instructions.

### 4.9 Messaging & Support ⚙️
- Secure patient–provider messaging, threaded by topic (dose, side effect, refill, lab,
  appointment).
- Photo attachments; optional voice notes.
- Clinic hours and expected response time shown.
- Automated triage prompts; urgent-symptom escalation tags.

### 4.10 Refills & Reorders ⚙️
A major business workflow.

- "Request refill" button.
- Refill status visible to patient: requested → under review → approved → awaiting payment →
  sent to pharmacy → shipped → delivered.
- Shipment tracking; refill reminders driven by supply projection (§4.4).
- Subscription / recurring program support.

### 4.11 Appointments ⚙️
- Book follow-up visits; reminders.
- Pre-visit questionnaire; post-visit summary.
- "Required appointment before refill" rules surfaced to the patient.
- Telehealth is **scheduling-only for MVP**: Beacon stores the clinic's external visit link;
  embedded in-app video is deferred to a later phase.

### 4.12 Education ⚙️ / 🔬
- 🔬 Reconstitution and injection-technique guides (video + step-by-step).
- Protocol-specific education; storage/handling guides.
- Clinic-authored content library; required acknowledgments.
- Optional patient quiz/checklist before first dose.

---

## 5. Clinic Provider Portal

### 5.1 Provider Dashboard ⚙️
A clean operating dashboard.

- Active patients; new intakes; patients due for follow-up.
- Patients with missed doses; patients reporting side effects.
- Refill requests; lab review queue; messages needing response.
- Patients at risk of churn.
- Revenue and program metrics (admin role).

### 5.2 Patient Profile ⚙️
A unified longitudinal record: demographics, goals, medical history, allergies, current
meds, active/past protocols, dose-adherence timeline, side-effect history, outcome charts,
labs, photos, notes, messages, orders/refills, consent status, payment/subscription status,
assigned care team.

### 5.3 🔬 Protocol Builder — *most important provider-side feature*
- Create reusable protocol templates configuring: peptide/product, dose, route, frequency,
  duration, **titration schedule**, **cycle schedule**, **reconstitution parameters**,
  patient instructions, monitoring requirements, required labs, follow-up cadence, refill
  rules, red-flag symptoms.
- Pre-set reconstitution parameters flow directly into the patient's calculator (§4.3).
- Clone and customize per patient; version history; provider signature/approval.
- Parameter locking — staff cannot change clinical parameters without permission.

### 5.4 Care Plan Assignment ⚙️
- Assign protocol to patient; set start date; select product/vial/kit.
- Attach education; set reminders and check-in frequency.
- Require baseline labs/photos/forms.
- Generate patient-facing care plan; send invite/activation.

### 5.5 Adherence Monitoring ⚙️ / 🔬
- Adherence percentage; missed/late dose alerts; dose-pattern view.
- 🔬 Injection-site rotation view.
- Patient notes attached to dose logs; provider comments.
- Bulk outreach to non-adherent patients.

### 5.6 Side Effect Triage ⚙️
- Side-effect inbox with severity filters and protocol-specific triage rules.
- Auto-flags for red-flag symptoms; assignment to provider/staff.
- Internal notes; patient follow-up templates; escalation workflow; resolution status; SLA
  timers.

### 5.7 Outcomes & Progress Review ⚙️
- Before/after photo comparison; trend charts by metric; lab-trend overlays.
- Adherence-vs-outcome correlation.
- Provider-generated progress reports; patient-facing summary; exportable PDF for visits.
- Cohort-level outcome reporting.

### 5.8 Labs Management ⚙️
- Lab order checklist; upload review queue; manual entry.
- Abnormal-value flagging rules; "required lab before refill" gating.
- Provider comments; lab timeline.
- Lab-result parser and lab-vendor integration — *later phase*.

### 5.9 Messaging Inbox ⚙️
- Unified inbox; team assignment; internal notes; saved replies.
- Message categories; SLA timers; escalation indicators; attachments.
- Full audit trail; patient-context sidebar.

### 5.10 Refill & Order Management ⚙️
- Refill request queue with **eligibility rules engine** — gates on remaining doses,
  protocol timing, provider approval, lab requirement, payment status, follow-up-visit
  requirement.
- Approve / deny / request-appointment actions; send payment link; create order.
- **Two fulfillment paths** per order:
  - *In-house dispensing* — decrement local clinic inventory (§5.11), log the dispense.
  - *Compounding pharmacy* — route the order to a pharmacy partner. Electronic pharmacy
    *integration* is Phase 3; until then, structured order export / manual submission.
- Track fulfillment; capture pharmacy, lot, expiration, quantity; notify patient.
- Refill history; subscription management.

### 5.11 Inventory Management ⚙️ — *MVP-tier*
Required at MVP because clinics dispense in-house.

- Product catalog; inventory by location; lot-number and expiration tracking.
- Vial/kit quantities; low-stock and expiring-lot alerts; waste/loss tracking.
- Dispensing log with patient assignment; recall support by lot number.
- Inventory decremented automatically when an order is fulfilled in-house (§5.10).
- Purchase orders and supplier management — *later phase*.

### 5.12 Payments & Commerce ⚙️
- Product/program catalog; one-time purchases; subscriptions; refill payments; payment plans.
- Coupons/discounts; refunds; patient invoices.
- Revenue dashboard (provider/admin).
- Stripe integration. **Clinical approval and payment collection are kept separate.**

### 5.13 Forms, Consents & Documentation ⚙️
- Digital consent forms, medical intake, follow-up and side-effect questionnaires.
- E-signature; form versioning; required-forms-before-treatment gating.
- PDF export; timestamps; audit trail.

### 5.14 Clinic Admin ⚙️
- Multi-location support; provider/staff accounts; role-based permissions.
- Patient assignment; brand settings; notification settings.
- Protocol template library; product catalog; form builder.
- Billing settings; audit logs; data export; deactivation/access control.
- 🔬 **Telehealth licensure matching** — patients are matched only to providers licensed in
  the patient's state.

---

## 6. Integration Layer — "Seamless" Both Sides

The platform revolves around a shared set of synced objects (these are effectively the data
model — see §9):

`Patient profile · Treatment plan · Dose schedule · Dose logs · Vial/reconstitution records ·
Symptoms/side effects · Labs · Messages · Refills/orders · Inventory/dispensing records ·
Payments · Appointments · Documents/consents`

### Example end-to-end flows

- **Patient misses 2 doses** → clinic sees an adherence alert, patient gets a gentle
  reminder, provider can message or adjust follow-up.
- **Patient reports a moderate side effect** → app asks structured follow-up questions,
  clinic gets a triage alert, provider responds inside the patient chart.
- **Patient requests a refill** → system checks adherence, labs, payment, appointment
  requirements, and provider approval before advancing.
- **Provider updates a protocol** → patient app immediately updates schedule, instructions,
  reminders, reconstitution parameters, and education.
- **Reconstituted vial nears BUD** → patient gets a discard alert; supply projection and
  refill timing update automatically.
- **Clinic receives a new lab** → provider reviews and comments; patient sees a simplified
  explanation once released.

---

## 7. Compliance & Safety

Treat compliance as a product feature from day one.

### Data protection
- HIPAA-ready architecture; Business Associate Agreements with all relevant vendors
  (hosting, video, SMS/email, analytics).
- Encryption in transit and at rest; role-based access; least-privilege; audit logs.
- Secure messaging; PHI-safe notifications; device/session management; staff activity logs.
- Consent tracking; data retention controls; patient data export; breach-response workflow.
- **FTC Health Breach Notification Rule** — applies to health apps handling identifiable
  health data even when the company is *not* acting as a HIPAA business associate. Design
  breach notification to satisfy it.

### Regulatory / product guardrails
- No autonomous prescribing; no automated dose changes without provider approval.
- Clear separation between patient tracking and medical advice.
- Clinic-controlled educational content; strong audit trail for protocol changes.
- **Compounded-product disclaimers** — many peptides are compounded and not FDA-approved for
  the marketed use; keep clinical claims conservative and provider-gated.
- Lot/expiration tracking for dispensed products; recall workflow by lot.
- Telehealth state-licensure matching (§5.14).

> A compliance/legal review is recommended before launch.

---

## 8. Integrations

| Category | Examples | Phase |
|----------|----------|-------|
| Payments | Stripe | MVP |
| Messaging | Twilio (SMS), SendGrid (email) | MVP |
| Identity / e-signature | DocuSign, Dropbox Sign | Phase 2 |
| Scheduling | Calendly, NexHealth, Acuity | Phase 2 |
| Wearables | Apple Health, Google Health Connect, Oura, Whoop, Withings | Phase 2 |
| Pharmacy / fulfillment | Partner-specific APIs | Phase 3 |
| Labs | Quest, Labcorp, Rupa, Health Gorilla | Phase 3 |
| EHR/EMR | Elation, Athena, DrChrono, Charm, AdvancedMD | Phase 3 |
| Analytics | Data warehouse + BI | Phase 2 |

---

## 9. Analytics

**Clinic analytics:** active patients, new starts, adherence rate, refill conversion, churn
risk, revenue by protocol/product, side-effect frequency, average outcome change, provider
response time, lab completion rate, follow-up completion rate, inventory turnover, expiring-
inventory risk.

**Patient analytics:** progress over time, dose adherence, symptom trends, goal progress,
labs over time, refill timeline, vial-supply burn-down.

---

## 10. Product Modules

1. Patient Mobile App
2. Provider Web Portal
3. Clinic Admin Console
4. Protocol Engine (titration, cycling, reconstitution parameters)
5. Dose & Reminder Engine
6. Vial & Supply Engine 🔬
7. Messaging / Triage
8. Refill / Order System
9. Inventory System
10. Labs / Documents
11. Analytics & Reporting
12. Compliance / Audit Layer
13. Integrations Layer

---

## 11. Release Phasing

### MVP — prove the moat + the core loop

🔬 **Peptide-specific (build first and best):**
- Reconstitution calculator with visual syringe and unit conversion
- Provider-prefilled reconstitution parameters
- Active-vial tracking + beyond-use-date alerts
- Supply projection / doses-remaining
- Titration and cycle scheduling
- Injection-site rotation tracker

⚙️ **Generic care platform (table stakes for MVP):**
- Invite onboarding; consent/forms
- Treatment plan view
- Dose reminders and logging
- Symptom / side-effect logging
- Progress metrics
- Secure messaging
- Refill request → provider approval queue (with eligibility rules)
- Order fulfillment — in-house dispensing path + manual pharmacy submission path
- Inventory (catalog, lot/expiration, dispensing log, low-stock alerts)
- Appointment scheduling (booking, reminders, pre/post-visit; external telehealth link)
- Patient list / profile
- Protocol Builder + care-plan assignment
- Adherence dashboard; side-effect inbox
- Admin roles & permissions

**Platform:** HIPAA-ready auth/security, audit logs, notifications, basic analytics, Stripe,
data export.

### Phase 2 — depth & retention
- Wearable integrations; advanced outcome reporting
- Labs management depth; e-signature and scheduling integrations
- Embedded telehealth video (HIPAA-compliant vendor + BAA)
- Clinic branding / notification config; cohort analytics
- Subscriptions and payment plans; multi-location

### Phase 3 — enterprise & ecosystem
- Pharmacy fulfillment integration; lab-vendor integration; EHR sync
- Lab-result parsing
- Inventory purchasing & supplier management; recall workflow
- Risk scoring for non-adherence/churn
- AI-assisted chart summaries and triage suggestions (provider-reviewed, never autonomous)
- White-label patient app; patient education/community programs

---

## 12. Resolved Decisions

| # | Decision | Choice | Implications |
|---|----------|--------|--------------|
| 1 | **Platform** | Native mobile (iOS/Android) for patients; web app for providers/admin. | Two front-end codebases. Native gives reliable push reminders, camera for progress photos / vial scan, and a high-fidelity syringe UI for the reconstitution calculator. |
| 2 | **Fulfillment** | Both — clinics dispense in-house **and** route orders to compounding-pharmacy integrations. | Inventory module (§5.11) is MVP-tier, not later-phase. Refill/order system (§5.10) must support two fulfillment paths: decrement local stock, or route to a pharmacy partner. Pharmacy *integration* itself stays Phase 3; until then, in-house dispensing plus manual pharmacy submission. |
| 3 | **Telehealth** | Scheduling-only for MVP — booking, reminders, pre-visit questionnaire, post-visit summary. No embedded video. | No video vendor or BAA for video in MVP. Clinics use their existing telehealth tool; Beacon stores the visit link. Embedded video deferred to a later phase. |

---

## 13. Strategic Summary

The strongest version of Beacon is a lightweight operating system for peptide programs —
better adherence, safer monitoring, faster refills, stronger documentation, better outcomes
data, more clinic revenue visibility. The reconstitution/vial/dosing layer (🔬) is the moat;
the care-platform layer (⚙️) is necessary but not differentiating. Build the moat first.
