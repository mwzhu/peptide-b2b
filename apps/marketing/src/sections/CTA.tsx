import { ArrowRight, Calendar, MessageCircle } from 'lucide-react';

export function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden py-24">
      {/* Gradient backdrop */}
      <div className="absolute inset-x-6 inset-y-12 -z-10 rounded-[44px] bg-gradient-to-br from-sage-400 via-sage-500 to-sage-700 md:inset-x-12 md:inset-y-8" />
      <div
        aria-hidden
        className="absolute right-[-100px] top-[-60px] -z-10 h-[420px] w-[420px] rounded-full bg-clay-300/30 blur-3xl"
      />

      <div className="mx-auto max-w-4xl px-10 py-12 text-center text-primary-on md:py-16">
        <p className="text-overline font-semibold uppercase tracking-widest text-primary-on/70">
          Let’s see if Beacon fits your clinic
        </p>
        <h2 className="mt-3 font-display text-balance text-[40px] font-semibold leading-tight md:text-[52px]">
          A 20-minute demo, tailored to how your program runs today.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-body text-primary-on/85 md:text-lg">
          We’ll walk you through onboarding a real patient end-to-end — protocol, dosing,
          adherence, refill, and audit — using your peptides and your workflow.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#"
            className="group inline-flex items-center gap-2 rounded-full bg-primary-on px-6 py-3.5 text-body font-semibold text-sage-700 transition-transform hover:scale-[1.02]"
          >
            <Calendar size={17} />
            Book a 20-min demo
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-primary-on/30 bg-transparent px-6 py-3.5 text-body font-medium text-primary-on transition-colors hover:bg-primary-on/10"
          >
            <MessageCircle size={17} />
            Email the founders
          </a>
        </div>

        <p className="mt-7 text-caption text-primary-on/70">
          No credit card · BAA available pre-demo · We respect your time and your inbox
        </p>
      </div>
    </section>
  );
}
