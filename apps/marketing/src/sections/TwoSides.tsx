import { ArrowLeftRight, Bell, Check, MessageCircle, Syringe } from 'lucide-react';
import { PhoneMockup } from '../components/Mockups';

const PATIENT_FEATURES = [
  {
    Icon: Syringe,
    title: 'Today’s dose, ready to log',
    detail: 'No guessing — the exact draw shows up on the patient’s home screen.',
  },
  {
    Icon: ArrowLeftRight,
    title: 'Injection-site rotation',
    detail:
      'A body-map picker suggests the next site and warns on overuse. Healthier skin, fewer reactions.',
  },
  {
    Icon: Bell,
    title: 'Beyond-use-date reminders',
    detail:
      'Patients know exactly when to discard a reconstituted vial — no expired solution in the queue.',
  },
  {
    Icon: MessageCircle,
    title: 'Secure messaging to your team',
    detail:
      'Side effects, refill questions, dose check-ins. Categorized, attributable, and SLA-tracked on your side.',
  },
];

export function TwoSides() {
  return (
    <section id="two-sides" className="relative overflow-hidden bg-sand-50 py-24">
      <div
        aria-hidden
        className="absolute inset-y-0 left-1/2 hidden w-px bg-border lg:block"
      />
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-overline font-semibold uppercase tracking-widest text-clay-500">
            Two apps, one program
          </p>
          <h2 className="mt-3 font-display text-balance text-[36px] font-semibold leading-tight text-ink md:text-[44px]">
            Patients get a calm companion. <br className="hidden md:block" />
            You get the operations layer.
          </h2>
          <p className="mt-5 text-body text-ink-secondary md:text-lg">
            What you prescribe shows up in the patient app instantly. What they log shows
            up in your worklist. No re-keying, no shared spreadsheets.
          </p>
        </div>

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-2">
          {/* Phone */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-8 -z-10 rounded-[60px] bg-gradient-to-br from-sage-200 via-clay-100 to-canvas opacity-70 blur-2xl" />
              <PhoneMockup />
              <div className="absolute -right-4 top-12 hidden animate-float-slow lg:block">
                <DoseLoggedToast />
              </div>
            </div>
          </div>

          {/* Patient features */}
          <div className="space-y-7">
            {PATIENT_FEATURES.map(({ Icon, title, detail }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface ring-1 ring-border">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-body font-semibold text-ink">{title}</h3>
                  <p className="mt-0.5 text-bodySm text-ink-secondary">{detail}</p>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-success" />
                <p className="text-overline font-semibold uppercase tracking-wide text-ink-muted">
                  REAL-TIME SYNC
                </p>
              </div>
              <p className="mt-2 text-bodySm text-ink-secondary">
                When you approve a protocol or update a titration step, the patient app
                updates immediately — driven by a backend-owned WebSocket invalidation
                layer that keeps clinical state authoritative on the server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DoseLoggedToast() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-lg">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-soft">
        <Check size={16} className="text-success" strokeWidth={3} />
      </div>
      <div>
        <p className="text-bodySm font-semibold text-ink">Dose logged</p>
        <p className="text-caption text-ink-muted">Visible in your dashboard now</p>
      </div>
    </div>
  );
}
