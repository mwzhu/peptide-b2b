/** Display formatting for the provider console. */
import type { DoseAmount, InjectionSite } from '@beacon/domain';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function relativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diff / 60000);
  const abs = Math.abs(mins);
  if (abs < 1) return 'just now';
  if (abs < 60) return diff < 0 ? `${abs}m ago` : `in ${abs}m`;
  const hrs = Math.round(abs / 60);
  if (hrs < 24) return diff < 0 ? `${hrs}h ago` : `in ${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days === 1) return diff < 0 ? 'yesterday' : 'tomorrow';
  return diff < 0 ? `${days}d ago` : `in ${days}d`;
}

export function age(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

export function formatDose(dose: DoseAmount): string {
  return `${dose.value} ${dose.unit}`;
}

export function formatCurrency(usd: number): string {
  return `$${usd.toLocaleString('en-US')}`;
}

export function formatWeight(kg: number): string {
  return `${Math.round(kg * 2.20462 * 10) / 10} lb`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter((p) => /[A-Za-z]/.test(p[0] ?? ''))
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function titleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const SITE_LABELS: Record<InjectionSite, string> = {
  abdomen_left: 'Abdomen L',
  abdomen_right: 'Abdomen R',
  thigh_left: 'Thigh L',
  thigh_right: 'Thigh R',
  arm_left: 'Arm L',
  arm_right: 'Arm R',
  glute_left: 'Glute L',
  glute_right: 'Glute R',
};

export function formatSite(site: InjectionSite): string {
  return SITE_LABELS[site];
}

export function fullName(p: { firstName: string; lastName: string }): string {
  return `${p.firstName} ${p.lastName}`;
}
