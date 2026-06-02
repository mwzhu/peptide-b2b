import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import { initials } from '../lib/format';

/* --------------------------------- Button -------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-on hover:bg-primary-hover border-transparent',
  secondary: 'bg-surface text-ink border-border-strong hover:bg-sand-100',
  ghost: 'bg-transparent text-ink-secondary border-transparent hover:bg-sand-100',
  danger: 'bg-danger-soft text-danger border-transparent hover:brightness-95',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border font-medium',
        'transition-all active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none',
        size === 'sm' ? 'h-9 px-3.5 text-bodySm' : 'h-11 px-5 text-body',
        BTN_VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------------------------------- Card --------------------------------- */

export function Card({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-border bg-surface shadow-sm',
        onClick && 'cursor-pointer transition-shadow hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-h3 text-ink">{children}</h2>
      {action}
    </div>
  );
}

/* --------------------------------- Badge --------------------------------- */

type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const BADGE: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-ink-secondary',
  brand: 'bg-primary-soft text-sage-700',
  accent: 'bg-accent-soft text-clay-600',
  success: 'bg-success-soft text-green-700',
  warning: 'bg-warning-soft text-amber-700',
  danger: 'bg-danger-soft text-red-700',
  info: 'bg-info-soft text-blue-700',
};

export function Badge({ tone = 'neutral', children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-overline font-semibold uppercase tracking-wide',
        BADGE[tone],
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* --------------------------------- Avatar -------------------------------- */

export function Avatar({ name, hue, size = 40 }: { name: string; hue: number; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: `hsl(${hue}, 38%, 86%)`,
        color: `hsl(${hue}, 42%, 32%)`,
        fontSize: size * 0.36,
      }}
    >
      {initials(name)}
    </div>
  );
}

/* ---------------------------------- Stat --------------------------------- */

export function Stat({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: 'brand' | 'danger' | 'warning';
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-overline font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
        {icon}
      </div>
      <p
        className={cn(
          'mt-2 font-display text-h1',
          tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-ink',
        )}
      >
        {value}
      </p>
      {hint && <div className="mt-1 text-caption text-ink-muted">{hint}</div>}
    </Card>
  );
}

/* -------------------------------- Spinner -------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary',
        className,
      )}
    />
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner />
    </div>
  );
}

/* ------------------------------- EmptyState ------------------------------ */

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken text-ink-muted">
        {icon}
      </div>
      <p className="mt-1 font-display text-h3 text-ink">{title}</p>
      <p className="max-w-sm text-bodySm text-ink-muted">{message}</p>
    </div>
  );
}

/* ------------------------------ ProgressBar ------------------------------ */

export function ProgressBar({ value, tone = 'primary' }: { value: number; tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' }) {
  const fill = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
  }[tone];
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
      <div className={cn('h-full rounded-full', fill)} style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  );
}

/* ---------------------------------- Tabs --------------------------------- */

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'relative -mb-px flex items-center gap-2 px-4 py-2.5 text-bodySm font-medium transition-colors',
            value === t.value ? 'text-primary' : 'text-ink-muted hover:text-ink-secondary',
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-overline font-semibold',
                value === t.value ? 'bg-primary-soft text-sage-700' : 'bg-surface-sunken text-ink-muted',
              )}
            >
              {t.count}
            </span>
          )}
          {value === t.value && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------- Field --------------------------------- */

export function Field({ label, hint, children }: { label?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-bodySm font-semibold text-ink-secondary">{label}</span>}
      {children}
      {hint && <span className="text-caption text-ink-muted">{hint}</span>}
    </label>
  );
}

const INPUT_CLASS =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-body text-ink ' +
  'placeholder:text-ink-muted outline-none transition-colors focus:border-primary';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(INPUT_CLASS, props.className)} />;
}

export function Textarea(props: InputHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      className={cn(INPUT_CLASS, 'min-h-[88px] resize-y', props.className)}
    />
  );
}

export function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(INPUT_CLASS, 'appearance-none', props.className)}>
      {children}
    </select>
  );
}

/* -------------------------------- Dialog --------------------------------- */

export function Dialog({
  open,
  onClose,
  title,
  children,
  width = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn('relative w-full animate-scale-in rounded-3xl border border-border bg-surface shadow-xl', width)}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-display text-h3 text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------- PageHeader ------------------------------ */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {subtitle && (
          <p className="text-overline font-semibold uppercase tracking-wide text-ink-muted">
            {subtitle}
          </p>
        )}
        <h1 className="font-display text-h1 text-ink">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
