import { Eye, FileCheck, KeyRound, Lock, MapPin, Scroll } from 'lucide-react';

const ITEMS = [
  {
    Icon: Lock,
    title: 'HIPAA-ready architecture',
    detail:
      'Encryption in transit and at rest, role-based access, append-only audit logging, and PHI-safe notification copy by default.',
  },
  {
    Icon: FileCheck,
    title: 'BAAs with every vendor',
    detail:
      'AWS, Twilio, SendGrid, Stripe. We don’t bring in a tool that can touch patient data without a signed BAA.',
  },
  {
    Icon: Scroll,
    title: 'FTC Health Breach Notification ready',
    detail:
      'A documented breach-response workflow that satisfies both HIPAA and the FTC rule for health apps that aren’t covered entities.',
  },
  {
    Icon: KeyRound,
    title: 'Mandatory MFA for staff',
    detail:
      'Provider, RN, MA, admin — all sign in with multi-factor. Session revocation and device management built in.',
  },
  {
    Icon: MapPin,
    title: 'Telehealth licensure guardrails',
    detail:
      'Patients are only matched to providers licensed in the patient’s state. Enforced server-side, not as a UI suggestion.',
  },
  {
    Icon: Eye,
    title: 'Audit log you can actually export',
    detail:
      'Every protocol approval, dose change, refill decision, and chart view recorded with actor, action, and timestamp.',
  },
];

export function Compliance() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-overline font-semibold uppercase tracking-widest text-sage-600">
            Compliance
          </p>
          <h2 className="mt-3 font-display text-balance text-[36px] font-semibold leading-tight text-ink md:text-[44px]">
            Compliance built in, not bolted on.
          </h2>
          <p className="mt-5 text-body text-ink-secondary md:text-lg">
            We treat compliance as a product feature from day one — because if it doesn’t
            survive an audit, none of the rest matters.
          </p>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ Icon, title, detail }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-body font-semibold text-ink">{title}</h3>
                <p className="mt-0.5 text-bodySm text-ink-secondary">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-caption text-ink-muted">
          Beacon is not a substitute for medical judgment. The app is an adherence,
          monitoring, and operations tool — every clinical parameter is configured or
          approved by licensed clinic staff.
        </p>
      </div>
    </section>
  );
}
