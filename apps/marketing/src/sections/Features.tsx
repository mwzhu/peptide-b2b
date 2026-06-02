import {
  Boxes,
  ClipboardList,
  HeartPulse,
  Package,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';

const FEATURES = [
  {
    Icon: ClipboardList,
    title: 'Protocol builder',
    detail:
      'Reusable templates with titration ladders, cycling, monitoring requirements, and reconstitution parameters that flow straight into the patient app.',
  },
  {
    Icon: HeartPulse,
    title: 'Needs-attention worklist',
    detail:
      'Open triage cases, flagged patients, and churn risk in one prioritized list — so you start the day with the right ten conversations.',
  },
  {
    Icon: Package,
    title: 'Refills with two fulfillment paths',
    detail:
      'A rules-based eligibility engine gates on adherence, labs, payment, and approval. Fulfill in-house from your lot ledger, or route to a compounding partner.',
  },
  {
    Icon: Boxes,
    title: 'Inventory you can audit',
    detail:
      'Lot-level tracking, expiration alerts, dispensing records, and recall lookup — derived from an append-only ledger so the numbers always reconcile.',
  },
  {
    Icon: Stethoscope,
    title: 'Side-effect triage',
    detail:
      'Severe reports auto-flag a triage case, notify the care team, and record the full decision path. SLA timers keep response times honest.',
  },
  {
    Icon: TrendingUp,
    title: 'Adherence & outcomes',
    detail:
      'Per-patient dose timelines, longitudinal weight and measurement trends, and protocol-level retention — without exporting anything to a spreadsheet.',
  },
];

export function Features() {
  return (
    <section id="product" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-overline font-semibold uppercase tracking-widest text-sage-600">
            Provider console
          </p>
          <h2 className="mt-3 font-display text-balance text-[36px] font-semibold leading-tight text-ink md:text-[44px]">
            One calm console for the whole peptide program.
          </h2>
          <p className="mt-5 text-body text-ink-secondary md:text-lg">
            Built around how clinicians actually work — worklists, not menus.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, detail }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-sage-200 hover:shadow-md"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-on">
                <Icon size={20} />
              </div>
              <h3 className="font-display text-h3 text-ink">{title}</h3>
              <p className="mt-2 text-bodySm text-ink-secondary">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
