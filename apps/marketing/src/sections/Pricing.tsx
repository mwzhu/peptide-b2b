import { Check, Sparkles } from 'lucide-react';

const TIERS = [
  {
    name: 'Starter',
    price: '$299',
    cadence: '/ clinic / month',
    blurb: 'For a single-provider medspa getting its peptide program off the ground.',
    features: [
      'Up to 100 active patients',
      'Patient app + provider console',
      'Reconstitution & dose engine',
      'Refill workflow (in-house dispensing)',
      'Inventory ledger for one location',
      'HIPAA-ready, signed BAA',
      'Email support',
    ],
    cta: 'Book a demo',
    featured: false,
  },
  {
    name: 'Growth',
    price: '$699',
    cadence: '/ clinic / month',
    blurb: 'For multi-provider clinics scaling their peptide program with confidence.',
    features: [
      'Up to 500 active patients',
      'Everything in Starter',
      'Triage SLAs & assignment',
      'Compounding-pharmacy order export',
      'Multi-provider roles & licensure matching',
      'Clinic branding in the patient app',
      'Priority support · onboarding included',
    ],
    cta: 'Book a demo',
    featured: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    cadence: 'multi-location',
    blurb: 'For groups running peptide programs across multiple locations or brands.',
    features: [
      'Unlimited active patients',
      'Multi-location inventory',
      'Lab & EHR integrations',
      'Cohort analytics & exports',
      'Dedicated implementation manager',
      'Security review & SOC 2 reports',
      'Custom SLAs',
    ],
    cta: 'Talk to sales',
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-overline font-semibold uppercase tracking-widest text-sage-600">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-balance text-[36px] font-semibold leading-tight text-ink md:text-[44px]">
            Simple pricing that scales with your roster.
          </h2>
          <p className="mt-5 text-body text-ink-secondary md:text-lg">
            One per-clinic subscription. No per-seat surprises. Cancel anytime — your data
            is exportable in standard formats.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-3xl border p-7 shadow-sm ${
                t.featured
                  ? 'border-sage-300 bg-surface ring-2 ring-primary/15'
                  : 'border-border bg-surface'
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-overline font-semibold text-primary-on">
                  <Sparkles size={11} /> MOST POPULAR
                </span>
              )}

              <div>
                <p className="font-display text-h3 text-ink">{t.name}</p>
                <p className="mt-2 text-bodySm text-ink-secondary">{t.blurb}</p>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-[44px] font-semibold leading-none text-ink">
                  {t.price}
                </span>
                <span className="text-bodySm text-ink-muted">{t.cadence}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-bodySm text-ink-secondary">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                      <Check size={12} className="text-primary" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-body font-semibold transition-colors ${
                  t.featured
                    ? 'bg-primary text-primary-on hover:bg-primary-hover'
                    : 'border border-border-strong bg-surface text-ink hover:bg-sand-100'
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-caption text-ink-muted">
          All plans include the patient app, provider console, encrypted PHI storage, and
          a signed BAA. Annual billing saves 15%.
        </p>
      </div>
    </section>
  );
}
