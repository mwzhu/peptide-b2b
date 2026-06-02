import { useState } from 'react';
import { Plus } from 'lucide-react';

const Q = [
  {
    q: 'Does Beacon prescribe peptides or recommend doses?',
    a: 'No. Beacon is an adherence, monitoring, and operations tool. Every clinical parameter — peptide, dose, titration, reconstitution — is configured or approved by licensed clinic staff. We don’t algorithmically change doses.',
  },
  {
    q: 'Is it HIPAA compliant?',
    a: 'Yes. Beacon is built on a HIPAA-ready architecture, signs BAAs, encrypts PHI at rest and in transit, and ships with mandatory MFA for staff users. We also support the FTC Health Breach Notification Rule for the cases where it applies.',
  },
  {
    q: 'How does fulfillment work?',
    a: 'Two paths. Most clinics dispense in-house — Beacon decrements your lot ledger and writes a dispensing record. For pharmacy fulfillment, the platform generates a structured order export today, and we’re rolling out direct compounding-pharmacy integrations in 2026.',
  },
  {
    q: 'Can patients use the app without our clinic?',
    a: 'No. Beacon is invite-based per clinic. A patient cannot create a standalone account or self-prescribe anything. They onboard through your invitation, sign your consents, and follow your care plan.',
  },
  {
    q: 'Do you integrate with my EHR?',
    a: 'EHR sync to common medspa systems (Elation, Athena, DrChrono, Charm) is on the Scale plan as a 2026 integration. Until then, Beacon exports clinical PDFs and structured data so visit summaries and lab results live anywhere they need to.',
  },
  {
    q: 'What does onboarding look like?',
    a: 'For Starter and Growth, you’re live in under two weeks: a half-day protocol-builder workshop, a brand setup pass, and a soft launch with 5–10 patients. Scale plans get a named implementation manager and run a structured rollout across locations.',
  },
  {
    q: 'How is dosing math actually correct?',
    a: 'Our reconstitution and supply engine is a pure module — no I/O — that performs every calculation in integer micrograms and microliters with a decimal library. It’s covered by golden tests reviewed with a clinical advisor and property tests for invariants like monotonicity.',
  },
  {
    q: 'What if a patient reports something severe?',
    a: 'Severe symptoms create a triage case immediately, notify the assigned care team, and start an SLA timer. The full decision path is recorded in your audit log. Patients see clear guidance to call 911 for genuine emergencies.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number>(0);
  return (
    <section id="faq" className="bg-sand-50 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="text-overline font-semibold uppercase tracking-widest text-sage-600">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-balance text-[36px] font-semibold leading-tight text-ink md:text-[44px]">
            Questions, answered.
          </h2>
        </div>

        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-surface">
          {Q.map((item, i) => (
            <button
              key={item.q}
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between gap-6 px-6 py-5">
                <p className="text-body font-semibold text-ink">{item.q}</p>
                <Plus
                  size={20}
                  className={`mt-0.5 shrink-0 text-ink-muted transition-transform ${
                    open === i ? 'rotate-45' : ''
                  }`}
                />
              </div>
              {open === i && (
                <p className="px-6 pb-5 text-bodySm text-ink-secondary">{item.a}</p>
              )}
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-bodySm text-ink-muted">
          Still curious?{' '}
          <a href="#cta" className="font-semibold text-primary hover:underline">
            Talk to our team
          </a>{' '}
          — we’re happy to walk through how we’d run your specific program.
        </p>
      </div>
    </section>
  );
}
