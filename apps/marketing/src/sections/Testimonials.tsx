import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'Our reconstitution support tickets dropped to almost nothing in the first month. The patient app just tells them: "draw to ten units." That used to be three phone calls.',
    name: 'Dr. Mara Reyes, MD',
    role: 'Medical Director, Solstice Wellness',
    hue: 162,
  },
  {
    quote:
      'The refill queue is where most clinics quietly lose money. Beacon turned ours into one screen with the eligibility decision already made.',
    name: 'Wendy Huang',
    role: 'Practice Administrator, Northstar Health',
    hue: 340,
  },
  {
    quote:
      'I can see at a glance who needs me today — severe symptoms, falling adherence, refill due. It’s the first software our team has actually opened on purpose.',
    name: 'Priya Lindqvist, NP',
    role: 'Nurse Practitioner, Vesta Longevity',
    hue: 288,
  },
];

export function Testimonials() {
  return (
    <section className="bg-sand-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-overline font-semibold uppercase tracking-widest text-clay-500">
            What clinicians say
          </p>
          <h2 className="mt-3 font-display text-balance text-[36px] font-semibold leading-tight text-ink md:text-[44px]">
            Built with the people who run the programs.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-7 shadow-sm"
            >
              <Quote size={22} className="text-sage-300" />
              <blockquote className="mt-4 text-body text-ink">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full font-semibold"
                  style={{
                    backgroundColor: `hsl(${t.hue}, 38%, 86%)`,
                    color: `hsl(${t.hue}, 42%, 32%)`,
                  }}
                >
                  {t.name
                    .replace('Dr.', '')
                    .trim()
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <p className="text-bodySm font-semibold text-ink">{t.name}</p>
                  <p className="text-caption text-ink-muted">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
