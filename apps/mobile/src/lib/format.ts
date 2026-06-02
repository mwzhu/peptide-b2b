/** Display formatting helpers for dates, doses, and clinical values. */
import type { DoseAmount, InjectionSite } from '@beacon/domain';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/** Human relative time — "2h ago", "in 3 days", "Today". */
export function relativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diff / 60000);
  const abs = Math.abs(mins);
  if (abs < 1) return 'Just now';
  if (abs < 60) return diff < 0 ? `${abs}m ago` : `in ${abs}m`;
  const hrs = Math.round(abs / 60);
  if (hrs < 24) return diff < 0 ? `${hrs}h ago` : `in ${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days === 0) return 'Today';
  if (days === 1) return diff < 0 ? 'Yesterday' : 'Tomorrow';
  return diff < 0 ? `${days}d ago` : `in ${days}d`;
}

export function dayOffsetLabel(iso: string): string {
  const target = new Date(iso);
  const now = new Date();
  const t = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const n = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((t - n) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  return formatLongDate(iso);
}

export function formatDose(dose: DoseAmount): string {
  return `${dose.value} ${dose.unit}`;
}

export function formatWeight(kg: number, unit: 'kg' | 'lb' = 'lb'): string {
  if (unit === 'lb') return `${Math.round(kg * 2.20462 * 10) / 10} lb`;
  return `${Math.round(kg * 10) / 10} kg`;
}

const SITE_LABELS: Record<InjectionSite, string> = {
  abdomen_left: 'Abdomen · Left',
  abdomen_right: 'Abdomen · Right',
  thigh_left: 'Thigh · Left',
  thigh_right: 'Thigh · Right',
  arm_left: 'Arm · Left',
  arm_right: 'Arm · Right',
  glute_left: 'Glute · Left',
  glute_right: 'Glute · Right',
};

export function formatSite(site: InjectionSite): string {
  return SITE_LABELS[site];
}

export function formatCurrency(usd: number): string {
  return `$${usd.toLocaleString('en-US')}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function titleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
