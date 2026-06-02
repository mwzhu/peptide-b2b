import { ArrowRight } from 'lucide-react';
import { DashboardMockup, PatientCardMini } from '../components/Mockups';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32">
      {/* Soft gradient blobs */}
      <div
        aria-hidden
        className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-sage-200 opacity-50 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -top-20 right-[-100px] h-[420px] w-[420px] rounded-full bg-clay-100 opacity-60 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* Copy */}
        <div className="animate-fade-up">
          <h1 className="font-display text-balance text-[44px] font-semibold leading-[1.05] tracking-tight text-ink md:text-[56px] lg:text-[64px]">
            Peptide care,{' '}
            <span className="italic text-sage-600">beautifully coordinated.</span>
          </h1>

          <p className="mt-5 max-w-xl text-balance text-body text-ink-secondary md:text-lg">
            Beacon is the operating system for peptide programs at medspas and wellness
            clinics. Build protocols, automate refills, monitor adherence, and give every
            patient a calm companion app — without the spreadsheets, group texts, or
            dosing-math drama.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#cta"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-body font-semibold text-primary-on shadow-md transition-all hover:bg-primary-hover hover:shadow-lg"
            >
              Book a 20-min demo
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </div>

          <p className="mt-7 text-caption text-ink-muted">
            HIPAA-ready · BAA available · No credit card required to demo
          </p>
        </div>

        {/* Visual */}
        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="relative mx-auto w-fit">
            <DashboardMockup />
            <div className="absolute -bottom-8 -left-6 hidden animate-float-slow md:block">
              <PatientCardMini />
            </div>
            <div className="absolute -right-4 top-10 hidden rotate-3 animate-float-slow md:block [animation-delay:1.2s]">
              <ChipFloat />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChipFloat() {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-3.5 py-2 shadow-md">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-success opacity-70" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
      </span>
      <span className="text-bodySm font-medium text-ink">Avery logged 500 mcg</span>
    </div>
  );
}
