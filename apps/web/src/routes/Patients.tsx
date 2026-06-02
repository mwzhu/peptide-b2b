import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Plus, Search } from 'lucide-react';
import type { PatientStatus } from '@beacon/domain';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Loading,
  PageHeader,
  ProgressBar,
} from '../components/ui';
import { formatShortDate, fullName, titleCase } from '../lib/format';
import { usePatients, useStaff } from '../lib/hooks';

const FILTERS: { value: PatientStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'needs_attention', label: 'Needs attention' },
  { value: 'lapsed', label: 'Lapsed' },
];

const STATUS_TONE: Record<PatientStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'brand'> = {
  active: 'success',
  onboarding: 'brand',
  needs_attention: 'warning',
  paused: 'neutral',
  lapsed: 'danger',
};

export function Patients() {
  const patients = usePatients();
  const staff = useStaff();
  const [filter, setFilter] = useState<PatientStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    if (!patients.data) return [];
    const q = search.trim().toLowerCase();
    return patients.data.filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (q && !`${fullName(p)} ${p.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [patients.data, filter, search]);

  if (!patients.data) return <Loading />;

  const providerName = (id: string) => staff.data?.find((s) => s.id === id)?.name ?? 'Unassigned';

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="Roster"
        actions={
          <>
            <Button variant="secondary" icon={<Filter size={16} />}>
              Filters
            </Button>
            <Button icon={<Plus size={16} />}>Invite patient</Button>
          </>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3.5 py-1.5 text-bodySm font-medium transition ${
                filter === f.value
                  ? 'border-primary bg-primary text-primary-on'
                  : 'border-border bg-surface text-ink-secondary hover:bg-sand-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-surface py-2 pl-9 pr-3 text-bodySm outline-none focus:border-primary"
          />
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-[2fr_1.4fr_1.4fr_0.8fr_0.9fr_1fr] gap-4 border-b border-border px-5 py-3 text-overline font-semibold uppercase tracking-wide text-ink-muted">
          <span>Patient</span>
          <span>Program</span>
          <span>Adherence</span>
          <span>Risk</span>
          <span>Status</span>
          <span>Enrolled</span>
        </div>
        {rows.length === 0 && (
          <p className="px-5 py-12 text-center text-bodySm text-ink-muted">No patients match these filters.</p>
        )}
        {rows.map((p) => (
            <Link
              key={p.id}
              to={`/patients/${p.id}`}
              className="grid grid-cols-[2fr_1.4fr_1.4fr_0.8fr_0.9fr_1fr] items-center gap-4 border-t border-border px-5 py-3.5 transition-colors hover:bg-sand-100"
            >
              <div className="flex items-center gap-3">
                <Avatar name={fullName(p)} hue={p.avatarHue} size={38} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{fullName(p)}</p>
                  <p className="truncate text-caption text-ink-muted">{p.email}</p>
                </div>
              </div>
              <div>
                <p className="text-bodySm text-ink">{p.tags[0] ?? '—'}</p>
                <p className="text-caption text-ink-muted">with {providerName(p.primaryProviderId)}</p>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-bodySm font-medium text-ink">
                    {Math.round(p.adherence30d * 100)}%
                  </span>
                  <span className="text-caption text-ink-muted">30d</span>
                </div>
                <ProgressBar
                  value={p.adherence30d}
                  tone={p.adherence30d >= 0.85 ? 'success' : p.adherence30d >= 0.7 ? 'warning' : 'danger'}
                />
              </div>
              <Badge tone={p.churnRisk === 'high' ? 'danger' : p.churnRisk === 'medium' ? 'warning' : 'success'}>
                {titleCase(p.churnRisk)}
              </Badge>
              <Badge tone={STATUS_TONE[p.status]} dot>
                {titleCase(p.status)}
              </Badge>
              <span className="text-bodySm text-ink-muted">{formatShortDate(p.enrolledAt)}</span>
            </Link>
        ))}
      </Card>
    </>
  );
}
