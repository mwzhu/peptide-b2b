import { FileSpreadsheet, MessageCircleQuestion, Syringe } from 'lucide-react';

const PAIN = [
  {
    Icon: Syringe,
    title: 'Reconstitution math goes wrong',
    detail:
      'Patients staring at a vial wondering how much BAC water to add, then converting mg to "units on this insulin syringe." Even one off-by-five error is a dosing event.',
  },
  {
    Icon: MessageCircleQuestion,
    title: '“Did Avery get her dose this week?”',
    detail:
      'Adherence lives in heads, group texts, and inbox threads. Refill timing is reactive. Side-effect reports get lost between visits.',
  },
  {
    Icon: FileSpreadsheet,
    title: 'Spreadsheets aren’t a clinical record',
    detail:
      'Protocols, vials, lots, expirations, consents, and lab follow-ups stretched across docs no one wants to audit — and that don’t hold up if a regulator asks.',
  },
];

export function Problem() {
  return (
    <section id="why-beacon" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-overline font-semibold uppercase tracking-widest text-sage-600">
            Why Beacon
          </p>
          <h2 className="mt-3 font-display text-balance text-[36px] font-semibold leading-tight text-ink md:text-[48px]">
            Running a peptide program shouldn’t feel like spreadsheets and group chats.
          </h2>
          <p className="mt-5 text-body text-ink-secondary md:text-lg">
            The clinics doing this well aren’t the ones with the most heroic staff —
            they’re the ones who stopped patching the workflow together by hand.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PAIN.map(({ Icon, title, detail }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
                <Icon size={22} className="text-primary" />
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
