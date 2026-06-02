import { useEffect, useState } from 'react';
import { Compass, Menu, X } from 'lucide-react';

const LINKS = [
  { href: '#why-beacon', label: 'Why Beacon' },
  { href: '#product', label: 'Product' },
  { href: '#two-sides', label: 'For patients' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? 'border-b border-border bg-canvas/85 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Compass size={18} className="text-primary-on" />
          </div>
          <span className="font-display text-h3 text-ink">Beacon</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-bodySm font-medium text-ink-secondary transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#cta"
            className="rounded-full bg-primary px-4 py-2 text-bodySm font-semibold text-primary-on transition-colors hover:bg-primary-hover"
          >
            Book a demo
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-ink md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <div className="mx-auto max-w-6xl px-6 py-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-bodySm font-medium text-ink-secondary"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#cta"
              onClick={() => setOpen(false)}
              className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-bodySm font-semibold text-primary-on"
            >
              Book a demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
