/**
 * Decorative product-preview mockups used across the landing page.
 * Built from styled divs/SVGs rather than real screenshots so they render
 * crisp at any size and stay in sync with the design system.
 */
import { Activity, Bell, CalendarDays, Compass, Droplet, Syringe, Users } from 'lucide-react';

export function DashboardMockup() {
  return (
    <div className="relative w-full max-w-[560px] rounded-3xl border border-border bg-surface shadow-xl">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-sand-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-sand-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-sand-300" />
        </div>
        <div className="rounded-full bg-surface-sunken px-3 py-1 text-overline font-semibold text-ink-muted">
          solstice.beacon.health
        </div>
        <div className="w-12" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-12 shrink-0 border-r border-border bg-sand-50 p-2 sm:block">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Compass size={14} className="text-primary-on" />
          </div>
          <div className="space-y-1">
            {[Activity, Users, CalendarDays, Bell].map((Icon, i) => (
              <div
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  i === 0 ? 'bg-primary-soft text-primary' : 'text-ink-muted'
                }`}
              >
                <Icon size={14} />
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                DASHBOARD
              </p>
              <p className="font-display text-body font-semibold text-ink">Today at Solstice</p>
            </div>
            <div className="rounded-full bg-success-soft px-2 py-0.5 text-[9px] font-semibold text-green-700">
              LIVE
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Active" value="148" />
            <MiniStat label="Adherence" value="93%" tone="brand" />
            <MiniStat label="Refills" value="6" tone="warning" />
          </div>

          {/* Needs attention */}
          <div className="mt-3 rounded-xl border border-border p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              NEEDS ATTENTION
            </p>
            <div className="space-y-1.5">
              <AttentionRow name="Jordan W." note="Severe nausea reported" tone="danger" hue={210} />
              <AttentionRow name="Marcus D." note="Injection-site redness" tone="warning" hue={24} />
            </div>
          </div>

          {/* Chart */}
          <div className="mt-3 rounded-xl border border-border p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              ADHERENCE — LAST 12 WEEKS
            </p>
            <Sparkline />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: 'brand' | 'warning' }) {
  return (
    <div className="rounded-lg border border-border p-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p
        className={`mt-0.5 font-display text-h3 ${
          tone === 'brand' ? 'text-primary' : tone === 'warning' ? 'text-warning' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function AttentionRow({
  name,
  note,
  tone,
  hue,
}: {
  name: string;
  note: string;
  tone: 'danger' | 'warning';
  hue: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-6 w-6 shrink-0 rounded-full"
        style={{ backgroundColor: `hsl(${hue}, 38%, 86%)` }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-ink">{name}</p>
        <p className="truncate text-[10px] text-ink-muted">{note}</p>
      </div>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase ${
          tone === 'danger' ? 'bg-danger-soft text-red-700' : 'bg-warning-soft text-amber-700'
        }`}
      >
        {tone === 'danger' ? 'CRITICAL' : 'HIGH'}
      </span>
    </div>
  );
}

function Sparkline() {
  // Inline SVG sparkline of clinic-wide adherence
  return (
    <svg width="100%" height="44" viewBox="0 0 260 44" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B8052" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6B8052" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,28 L20,24 L40,26 L60,22 L80,18 L100,20 L120,14 L140,16 L160,10 L180,12 L200,8 L220,10 L240,6 L260,8"
        stroke="#6B8052"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M0,28 L20,24 L40,26 L60,22 L80,18 L100,20 L120,14 L140,16 L160,10 L180,12 L200,8 L220,10 L240,6 L260,8 L260,44 L0,44 Z"
        fill="url(#sparkArea)"
      />
    </svg>
  );
}

/** Floating patient-app glance card. */
export function PatientCardMini() {
  return (
    <div className="w-[200px] rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 p-4 text-primary-on shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-semibold uppercase tracking-wide opacity-80">TODAY'S DOSE</p>
        <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold">
          8:00 AM
        </span>
      </div>
      <p className="mt-2.5 font-display text-h3 leading-tight">Semaglutide</p>
      <p className="text-[11px] opacity-80">500 mcg · subcutaneous</p>
      <div className="mt-3 flex items-center gap-2 border-t border-white/15 pt-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <Syringe size={14} />
        </div>
        <p className="flex-1 text-[10px] opacity-90">Draw to 10 units · U-100 syringe</p>
      </div>
    </div>
  );
}

/** Tiny inline syringe used in the dosing-engine section. */
export function SyringeIllustration() {
  return (
    <svg width="100%" viewBox="0 0 320 90" className="text-primary">
      <line x1="290" y1="45" x2="316" y2="45" stroke="#C7B58F" strokeWidth="3" strokeLinecap="round" />
      <rect x="282" y="38" width="12" height="14" rx="2" fill="#DDD0B4" />
      <rect x="32" y="32" width="252" height="26" rx="8" fill="#FFFDF8" stroke="#DDD0B4" strokeWidth="1.5" />
      <rect x="32" y="32" width="58" height="26" rx="8" fill="#A3B58C" opacity="0.55" />
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((t) => {
        const x = 32 + (252 * t) / 100;
        const major = t % 50 === 0;
        return (
          <g key={t}>
            <line x1={x} y1="32" x2={x} y2={32 + (major ? 11 : 7)} stroke="#C7B58F" strokeWidth={major ? 1.5 : 1} />
            {t % 20 === 0 && (
              <text x={x} y="26" fontSize="9" fill="#867A68" textAnchor="middle" fontFamily="Inter, system-ui">
                {t}
              </text>
            )}
          </g>
        );
      })}
      <line x1="90" y1="28" x2="90" y2="62" stroke="#54663F" strokeWidth="3" />
      <circle cx="90" cy="45" r="6" fill="#54663F" />
      <rect x="24" y="26" width="8" height="38" rx="3" fill="#DDD0B4" />
      <text x="90" y="80" fontSize="11" fill="#54663F" textAnchor="middle" fontFamily="Inter, system-ui" fontWeight="600">
        10 units
      </text>
    </svg>
  );
}

/** Phone-framed peek of the patient app, used in the two-sides section. */
export function PhoneMockup() {
  return (
    <div className="relative w-[260px] rounded-[40px] border-[6px] border-ink bg-canvas shadow-2xl">
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
      <div className="overflow-hidden rounded-[34px]">
        {/* Status bar */}
        <div className="flex h-9 items-center justify-between px-6 pt-3 text-[10px] font-semibold text-ink">
          <span>9:41</span>
          <div className="h-1 w-1" />
          <span>100%</span>
        </div>

        <div className="px-4 pb-6">
          {/* Greeting */}
          <p className="text-[10px] font-medium text-ink-muted">Tuesday, May 19</p>
          <p className="font-display text-h2 text-ink">Good morning, Avery</p>

          {/* Hero dose */}
          <div className="mt-3 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 p-3 text-primary-on">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-wide opacity-80">
                TODAY'S DOSE
              </p>
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px]">8:00 AM</span>
            </div>
            <p className="mt-1.5 font-display text-h3 leading-tight">Semaglutide</p>
            <div className="mt-3 flex items-center gap-2 border-t border-white/15 pt-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Syringe size={14} />
              </div>
              <div className="flex-1">
                <p className="font-display text-h3 leading-none">500 mcg</p>
                <p className="text-[9px] opacity-80">tap to log</p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sage-600">
                ✓
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-surface p-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-muted">
                ADHERENCE
              </p>
              <p className="font-display text-h3 text-ink">93%</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-muted">
                PROGRAM
              </p>
              <p className="font-display text-h3 text-primary">Wk 6</p>
            </div>
          </div>

          {/* Vial */}
          <div className="mt-3 rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-info-soft">
                <Droplet size={13} className="text-info" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-ink">Active vial</p>
                <p className="text-[9px] text-ink-muted">12 doses remaining</p>
              </div>
              <span className="rounded-full bg-warning-soft px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
                6D LEFT
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full w-3/5 rounded-full bg-info" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
