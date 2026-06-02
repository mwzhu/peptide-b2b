import { Calculator, Droplet, ShieldCheck } from 'lucide-react';
import { SyringeIllustration } from '../components/Mockups';

const POINTS = [
  {
    Icon: Calculator,
    title: 'Decimal-precise, no floating-point drift',
    detail:
      'Every clinical calculation runs in integer micrograms and microliters with a decimal library. No rounding surprises, ever.',
  },
  {
    Icon: Droplet,
    title: 'Beyond-use dates tracked per vial',
    detail:
      'When a patient reconstitutes a vial, Beacon owns the BUD and surfaces a discard warning days in advance — before they inject something that shouldn’t be used.',
  },
  {
    Icon: ShieldCheck,
    title: 'Provider-set, patient-rendered',
    detail:
      'Reconstitution parameters are configured in your protocol builder and rendered identically in the patient app. The patient never recomputes the dose — they read what you approved.',
  },
];

export function DosingEngine() {
  return (
    <section className="bg-sand-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-overline font-semibold uppercase tracking-widest text-clay-500">
              The moat
            </p>
            <h2 className="mt-3 font-display text-balance text-[36px] font-semibold leading-tight text-ink md:text-[44px]">
              The reconstitution math, done right.
            </h2>
            <p className="mt-5 text-body text-ink-secondary md:text-lg">
              Peptides arrive as lyophilized powder. Patients add bacteriostatic water,
              convert mg or mcg into <em>units on an insulin syringe</em>, and inject. One
              off-by-five draw is a real dosing event. Beacon makes the math
              disappear — for both sides.
            </p>

            <div className="mt-8 space-y-5">
              {POINTS.map(({ Icon, title, detail }) => (
                <div key={title} className="flex gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                    <Icon size={17} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-body font-semibold text-ink">{title}</h3>
                    <p className="mt-0.5 text-bodySm text-ink-secondary">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div>
            <div className="relative rounded-3xl border border-border bg-surface p-8 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-overline font-semibold uppercase tracking-wide text-ink-muted">
                    RECONSTITUTION CALCULATOR
                  </p>
                  <p className="font-display text-h3 text-ink">Semaglutide · 500 mcg dose</p>
                </div>
                <span className="rounded-full bg-success-soft px-2.5 py-1 text-overline font-semibold text-green-700">
                  PROVIDER APPROVED
                </span>
              </div>

              <SyringeIllustration />

              <div className="mt-2 text-center">
                <p className="font-display text-display text-sage-600">
                  10<span className="ml-2 font-display text-h2 text-ink-muted">units</span>
                </p>
                <p className="mt-1 text-bodySm text-ink-muted">
                  on a U-100 syringe · exact draw at this concentration
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 text-bodySm">
                <Detail label="Vial" value="10 mg" />
                <Detail label="Diluent" value="1 mL" />
                <Detail label="Doses / vial" value="20" />
              </div>
            </div>
            <p className="mt-3 text-center text-caption text-ink-muted">
              Real engine output from <code className="font-mono">@beacon/calculations</code>.
              Unit tested with clinician-reviewed golden cases.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-overline font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-h3 text-ink">{value}</p>
    </div>
  );
}
