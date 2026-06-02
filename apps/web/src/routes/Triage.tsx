import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ChevronRight, Stethoscope, Timer } from 'lucide-react';
import type { TriageStatus } from '@beacon/domain';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Loading,
  PageHeader,
  SectionTitle,
  Tabs,
} from '../components/ui';
import { fullName, relativeTime, titleCase } from '../lib/format';
import { usePatients, useSideEffects, useStaff, useTriageCases, useUpdateTriage } from '../lib/hooks';

const STATUS_TONE: Record<TriageStatus, 'warning' | 'danger' | 'info' | 'success'> = {
  new: 'warning',
  escalated: 'danger',
  in_review: 'info',
  resolved: 'success',
};

export function Triage() {
  const cases = useTriageCases();
  const patients = usePatients();
  const staff = useStaff();
  const update = useUpdateTriage();
  const [filter, setFilter] = useState<'open' | 'escalated' | 'resolved' | 'all'>('open');
  const [selected, setSelected] = useState<string | undefined>();

  if (!cases.data || !patients.data) return <Loading />;

  const patientById = (id: string) => patients.data.find((p) => p.id === id);
  const staffById = (id?: string) => (id ? staff.data?.find((s) => s.id === id) : undefined);

  const filtered = cases.data.filter((c) => {
    if (filter === 'open') return c.status === 'new' || c.status === 'in_review';
    if (filter === 'escalated') return c.status === 'escalated';
    if (filter === 'resolved') return c.status === 'resolved';
    return true;
  });

  const active = filtered.find((c) => c.id === selected) ?? filtered[0];

  const counts = {
    open: cases.data.filter((c) => c.status === 'new' || c.status === 'in_review').length,
    escalated: cases.data.filter((c) => c.status === 'escalated').length,
    resolved: cases.data.filter((c) => c.status === 'resolved').length,
    all: cases.data.length,
  };

  return (
    <>
      <PageHeader title="Triage queue" subtitle="Side-effect inbox" />

      <Tabs
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: 'open', label: 'Open', count: counts.open },
          { value: 'escalated', label: 'Escalated', count: counts.escalated },
          { value: 'resolved', label: 'Resolved', count: counts.resolved },
          { value: 'all', label: 'All', count: counts.all },
        ]}
      />

      <div className="mt-6 grid grid-cols-[1fr_1.4fr] gap-5">
        {/* List */}
        <Card>
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-bodySm text-ink-muted">No cases here.</p>
          ) : (
            filtered.map((c, idx) => {
              const p = patientById(c.patientId);
              const isActive = active?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full text-left px-5 py-4 ${idx > 0 ? 'border-t border-border' : ''} ${
                    isActive ? 'bg-primary-soft/60' : 'hover:bg-sand-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {p && <Avatar name={fullName(p)} hue={p.avatarHue} size={36} />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-ink">{p ? fullName(p) : 'Unknown'}</p>
                        <Badge tone={STATUS_TONE[c.status]}>{titleCase(c.status)}</Badge>
                      </div>
                      <p className="truncate text-bodySm text-ink-muted">{c.summary}</p>
                      <div className="mt-1 flex items-center gap-2 text-caption text-ink-muted">
                        <Timer size={12} />
                        <span>SLA {relativeTime(c.slaDueAt)}</span>
                        <span>· opened {relativeTime(c.openedAt)}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="mt-1.5 text-ink-muted" />
                  </div>
                </button>
              );
            })
          )}
        </Card>

        {/* Detail */}
        {active ? (
          <TriageDetail
            caseId={active.id}
            patientId={active.patientId}
            severity={active.severity}
            summary={active.summary}
            status={active.status}
            assignedToId={active.assignedToId}
            slaDueAt={active.slaDueAt}
            openedAt={active.openedAt}
            sideEffectId={active.sideEffectId}
            patientName={patientById(active.patientId) ? fullName(patientById(active.patientId)!) : 'Unknown'}
            avatarHue={patientById(active.patientId)?.avatarHue ?? 0}
            assignedName={staffById(active.assignedToId)?.name}
            onAction={(status, assignedToId) =>
              update.mutate({ caseId: active.id, status, assignedToId })
            }
          />
        ) : (
          <Card className="p-10">
            <p className="text-center text-bodySm text-ink-muted">Select a case to review.</p>
          </Card>
        )}
      </div>
    </>
  );
}

function TriageDetail(props: {
  caseId: string;
  patientId: string;
  severity: 'mild' | 'moderate' | 'severe';
  summary: string;
  status: TriageStatus;
  assignedToId?: string;
  slaDueAt: string;
  openedAt: string;
  sideEffectId: string;
  patientName: string;
  avatarHue: number;
  assignedName?: string;
  onAction: (status: TriageStatus, assignedToId?: string) => void;
}) {
  const sideEffects = useSideEffects(props.patientId);
  const event = sideEffects.data?.find((s) => s.id === props.sideEffectId);
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={props.patientName} hue={props.avatarHue} size={44} />
          <div>
            <Link to={`/patients/${props.patientId}`} className="font-display text-h3 text-ink hover:underline">
              {props.patientName}
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={props.severity === 'severe' ? 'danger' : props.severity === 'moderate' ? 'warning' : 'success'}>
                {props.severity}
              </Badge>
              <Badge tone={STATUS_TONE[props.status]}>{titleCase(props.status)}</Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-caption text-ink-muted">SLA</p>
          <p className="text-bodySm font-semibold text-warning">{relativeTime(props.slaDueAt)}</p>
        </div>
      </div>

      <Card className="mt-5 p-4 bg-danger-soft/40 border-danger-soft">
        <div className="flex items-start gap-3">
          <Stethoscope size={18} className="mt-0.5 text-danger" />
          <div className="flex-1">
            <p className="font-semibold text-ink">{props.summary}</p>
            {event?.note && <p className="mt-1 text-bodySm text-ink-secondary">"{event.note}"</p>}
            <p className="mt-2 text-caption text-ink-muted">Reported {relativeTime(props.openedAt)}</p>
          </div>
        </div>
      </Card>

      <div className="mt-5">
        <SectionTitle>Triage rules</SectionTitle>
        <ul className="space-y-2 text-bodySm text-ink-secondary">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-success" />
            Severity threshold met
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-success" />
            Care team automatically notified
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-success" />
            Follow-up questionnaire sent to patient
          </li>
        </ul>
      </div>

      <div className="mt-5">
        <SectionTitle>Assigned to</SectionTitle>
        <p className="text-bodySm text-ink">{props.assignedName ?? 'Unassigned'}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
        <Button onClick={() => props.onAction('in_review')}>Take case</Button>
        <Button
          variant="secondary"
          icon={<ArrowUpRight size={15} />}
          onClick={() => props.onAction('escalated', 'staff_reyes')}
        >
          Escalate
        </Button>
        <Button variant="ghost" icon={<CheckCircle2 size={15} />} onClick={() => props.onAction('resolved')}>
          Mark resolved
        </Button>
      </div>
    </Card>
  );
}
