export function Trusted() {
  return (
    <section className="border-y border-border bg-sand-50/60 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-overline font-semibold uppercase tracking-widest text-ink-muted">
          Trusted by peptide programs across the country
        </p>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 text-center sm:grid-cols-3 md:grid-cols-6">
          {[
            'Solstice Wellness',
            'Northstar Health',
            'Vesta Longevity',
            'Atlas Recovery',
            'Glow Medical',
            'Lumen Clinic',
          ].map((name) => (
            <p
              key={name}
              className="font-display text-base font-medium tracking-tight text-ink-secondary/80"
            >
              {name}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
