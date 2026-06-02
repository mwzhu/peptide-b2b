import { Compass } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      ['Why Beacon', '#why-beacon'],
      ['Provider console', '#product'],
      ['Patient app', '#two-sides'],
      ['Compliance', '#'],
      ['Pricing', '#pricing'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '#'],
      ['Careers', '#'],
      ['Contact', '#cta'],
      ['Press kit', '#'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['FAQ', '#faq'],
      ['Trust & security', '#'],
      ['Status', '#'],
      ['Changelog', '#'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Privacy', '#'],
      ['Terms of service', '#'],
      ['HIPAA notice', '#'],
      ['Responsible disclosure', '#'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <a href="#" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Compass size={18} className="text-primary-on" />
              </div>
              <span className="font-display text-h3 text-ink">Beacon</span>
            </a>
            <p className="mt-4 max-w-xs text-bodySm text-ink-secondary">
              The operating system for peptide programs at medspas and wellness clinics.
            </p>
            <p className="mt-6 text-caption text-ink-muted">
              Built with care in the U.S. — for clinics that treat people, not data points.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-overline font-semibold uppercase tracking-wide text-ink-muted">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-bodySm text-ink-secondary transition-colors hover:text-ink"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-caption text-ink-muted">
          <p>© {new Date().getFullYear()} Beacon Health, Inc. All rights reserved.</p>
          <p>
            Beacon is not a substitute for medical advice. Dosing decisions are made by
            licensed clinicians.
          </p>
        </div>
      </div>
    </footer>
  );
}
