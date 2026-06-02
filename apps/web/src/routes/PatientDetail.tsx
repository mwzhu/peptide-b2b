import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Droplet,
  FileText,
  FlaskConical,
  MessageSquare,
  Pencil,
  Pill,
  Send,
  Syringe,
  TrendingDown,
  TriangleAlert,
  User,
} from 'lucide-react';
import { daysUntil } from '@beacon/calculations';
import type { DoseStatus, OutcomeSeries } from '@beacon/domain';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Loading,
  PageHeader,
  ProgressBar,
  SectionTitle,
  Tabs,
} from '../components/ui';
import { TrendChart } from '../components/Chart';
import {
  age,
  formatDose,
  formatShortDate,
  formatTime,
  formatWeight,
  fullName,
  relativeTime,
  titleCase,
} from '../lib/format';
import {
  useAppointments,
  useCheckIns,
  useDocuments,
  useDoseLogs,
  useLabs,
  useOccurrences,
  useOutcomes,
  usePatient,
  usePatientThreads,
  useProducts,
  useProtocol,
  useSideEffects,
  useStaff,
  useVials,
} from '../lib/hooks';

type TabValue = 'overview' | 'adherence' | 'outcomes' | 'labs' | 'messages' | 'notes';

const STATUS_TONE: Record<DoseStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'brand'> = {
  taken: 'success',
  upcoming: 'neutral',
  due: 'brand',
  late: 'warning',
  missed: 'danger',
  skipped: 'neutral',
};

export function PatientDetail() {
  const { id = '' } = useParams();
  const patient = usePatient(id);
  const protocol = useProtocol(id);
  const vials = useVials(id);
  const occurrences = useOccurrences(id);
  const doseLogs = useDoseLogs(id);
  const outcomes = useOutcomes(id);
  const sideEffects = useSideEffects(id);
  const appointments = useAppointments(id);
  const labs = useLabs(id);
  const documents = useDocuments(id);
  const threads = usePatientThreads(id);
  const checkIns = useCheckIns(id);
  const products = useProducts();
  const staff = useStaff();
  const [tab, setTab] = useState<TabValue>('overview');

  if (!patient.data) return <Loading />;
  const p = patient.data;
  const productOf = (pid: string) => products.data?.find((x) => x.id === pid);
  const team = (staff.data ?? []).filter((s) => p.careTeamIds.includes(s.id));

  return (
    <>
      <Link to="/patients" className="mb-3 inline-flex items-center gap-1.5 text-bodySm text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> All patients
      </Link>

      <Card className="mb-6 p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={fullName(p)} hue={p.avatarHue} size={72} />
            <div>
              <h1 className="font-display text-h1 text-ink">{fullName(p)}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-bodySm text-ink-muted">
                <span>{age(p.dateOfBirth)} y/o</span>
                <span>·</span>
                <span>{p.phone}</span>
                <span>·</span>
                <span>{p.email}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="brand" dot>
                  {titleCase(p.status)}
                </Badge>
                {p.tags.map((t) => (
                  <Badge key={t} tone="neutral">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Send size={15} />}>
              Message
            </Button>
            <Button icon={<Pencil size={15} />}>Edit care plan</Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5">
          <Mini label="Adherence (30d)" value={`${Math.round(p.adherence30d * 100)}%`} />
          <Mini
            label="Program"
            value={protocol.data ? `Week ${protocol.data.currentWeek} / ${protocol.data.durationWeeks}` : '—'}
            hint={protocol.data?.name}
          />
          <Mini
            label="Weight change"
            value={formatWeight(p.startWeightKg - p.currentWeightKg)}
            hint={`Start ${formatWeight(p.startWeightKg)}`}
          />
        </div>
      </Card>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'adherence', label: 'Adherence' },
          { value: 'outcomes', label: 'Outcomes' },
          { value: 'labs', label: 'Labs & docs' },
          { value: 'messages', label: 'Messages', count: threads.data?.length ?? 0 },
          { value: 'notes', label: 'Notes' },
        ]}
      />

      <div className="mt-6 grid grid-cols-3 gap-5">
        {/* Main */}
        <div className="col-span-2 space-y-5">
          {tab === 'overview' && (
            <>
              {/* Active protocol */}
              <Card className="p-5">
                <SectionTitle
                  action={
                    <Link to="/protocols/builder" className="text-bodySm font-medium text-primary hover:underline">
                      Modify →
                    </Link>
                  }
                >
                  Active protocol
                </SectionTitle>
                {protocol.data ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft">
                        <ClipboardList size={22} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-h3 text-ink">{protocol.data.name}</p>
                        <p className="text-bodySm text-ink-muted">
                          Approved {formatShortDate(protocol.data.approvedAt)} ·{' '}
                          {staff.data?.find((s) => s.id === protocol.data!.approvedByProviderId)?.name}
                        </p>
                      </div>
                      <Badge tone="success" dot>
                        {titleCase(protocol.data.status)}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      {protocol.data.items.map((it) => {
                        const product = productOf(it.productId);
                        return (
                          <div key={it.id} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-sunken">
                              <Pill size={18} className="text-ink-muted" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-ink">{product?.name}</p>
                              <p className="text-caption text-ink-muted">
                                {formatDose(it.dose)} · {titleCase(it.frequency)} · {titleCase(it.route)}
                              </p>
                            </div>
                            <Badge tone="brand">{it.timeOfDay}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="py-3 text-bodySm text-ink-muted">No active protocol.</p>
                )}
              </Card>

              {/* Vials */}
              <Card className="p-5">
                <SectionTitle>Vials & supply</SectionTitle>
                <div className="space-y-3">
                  {vials.data?.map((v) => {
                    const left = Math.max(0, v.estimatedTotalDoses - v.dosesDrawn);
                    const bud = v.budDate ? daysUntil(v.budDate) : undefined;
                    return (
                      <div key={v.id} className="rounded-xl border border-border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-soft">
                            <Droplet size={18} className="text-info" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-ink">{productOf(v.productId)?.name}</p>
                            <p className="text-caption text-ink-muted">
                              {v.reconstitutedAt ? `Reconstituted ${formatShortDate(v.reconstitutedAt)}` : 'Awaiting reconstitution'}
                            </p>
                          </div>
                          {bud !== undefined && bud <= 7 && (
                            <Badge tone={bud <= 3 ? 'danger' : 'warning'} dot>
                              {bud}d to discard
                            </Badge>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-bodySm">
                          <span className="text-ink-secondary">
                            {left} of {v.estimatedTotalDoses} doses remaining
                          </span>
                          <span className="text-ink-muted">{v.dosesDrawn} drawn</span>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={left / v.estimatedTotalDoses} tone="info" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Side effects */}
              <Card className="p-5">
                <SectionTitle>Recent side effects</SectionTitle>
                {sideEffects.data && sideEffects.data.length > 0 ? (
                  <div className="space-y-3">
                    {sideEffects.data.slice(0, 4).map((s) => (
                      <div key={s.id} className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            s.severity === 'severe' ? 'bg-danger-soft text-danger' : s.severity === 'moderate' ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success'
                          }`}
                        >
                          <TriangleAlert size={14} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-ink">{s.type}</p>
                            <Badge tone={s.severity === 'severe' ? 'danger' : s.severity === 'moderate' ? 'warning' : 'success'}>
                              {s.severity}
                            </Badge>
                          </div>
                          <p className="text-caption text-ink-muted">{relativeTime(s.reportedAt)}</p>
                          {s.note && <p className="mt-1 text-bodySm text-ink-secondary">{s.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-3 text-bodySm text-ink-muted">No side effects reported.</p>
                )}
              </Card>
            </>
          )}

          {tab === 'adherence' && <AdherencePanel patientId={id} />}
          {tab === 'outcomes' && <OutcomesPanel series={outcomes.data ?? []} patient={p} />}
          {tab === 'labs' && (
            <Card className="p-5">
              <SectionTitle>Labs</SectionTitle>
              {labs.data?.map((panel) => (
                <div key={panel.id} className="mb-4 rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-ink">{panel.name}</p>
                      <p className="text-caption text-ink-muted">
                        {panel.resultedOn ? `Resulted ${formatShortDate(panel.resultedOn)}` : `Ordered ${formatShortDate(panel.orderedOn)}`}
                      </p>
                    </div>
                    <Badge tone={panel.status === 'released' ? 'success' : 'neutral'}>
                      {titleCase(panel.status)}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-bodySm">
                    {panel.values.map((v) => (
                      <div key={v.name} className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
                        <span className="text-ink-secondary">{v.name}</span>
                        <span className={v.flag === 'normal' ? 'text-ink' : 'text-danger'}>
                          {v.value} {v.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                  {panel.providerComment && (
                    <p className="mt-3 rounded-lg bg-surface-sunken p-3 text-bodySm text-ink-secondary">
                      {panel.providerComment}
                    </p>
                  )}
                </div>
              ))}
              <SectionTitle>Documents</SectionTitle>
              <div className="space-y-2">
                {documents.data?.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <FileText size={18} className="text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold text-ink">{d.title}</p>
                      <p className="text-caption text-ink-muted">
                        {titleCase(d.kind)} · {formatShortDate(d.createdAt)}
                      </p>
                    </div>
                    <Badge tone={d.signed ? 'success' : 'warning'}>{d.signed ? 'Signed' : 'Awaiting signature'}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {tab === 'messages' && (
            <Card className="p-5">
              <SectionTitle>Conversations</SectionTitle>
              {threads.data && threads.data.length > 0 ? (
                <div className="space-y-2">
                  {threads.data.map((t) => (
                    <Link
                      key={t.id}
                      to="/messages"
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-sand-100"
                    >
                      <MessageSquare size={18} className="text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold text-ink">{t.subject}</p>
                        <p className="truncate text-bodySm text-ink-muted">
                          {t.messages[t.messages.length - 1]?.body}
                        </p>
                      </div>
                      {t.urgent && <Badge tone="danger">Urgent</Badge>}
                      <span className="text-caption text-ink-muted">{relativeTime(t.lastMessageAt)}</span>
                      <ChevronRight size={16} className="text-ink-muted" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-3 text-bodySm text-ink-muted">No conversations yet.</p>
              )}
            </Card>
          )}
          {tab === 'notes' && (
            <Card className="p-5">
              <SectionTitle>Clinical notes</SectionTitle>
              <p className="text-bodySm text-ink-secondary">{protocol.data?.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle>Care team</SectionTitle>
            <div className="space-y-3">
              {team.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <Avatar name={s.name} hue={s.avatarHue} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-ink">{s.name}</p>
                    <p className="truncate text-caption text-ink-muted">{s.title}</p>
                  </div>
                  {s.id === p.primaryProviderId && <Badge tone="brand">Primary</Badge>}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle>Demographics</SectionTitle>
            <dl className="space-y-2 text-bodySm">
              <Row label="DOB" value={formatShortDate(p.dateOfBirth)} />
              <Row label="Sex" value={titleCase(p.sex)} />
              <Row label="Height" value={`${Math.round(p.heightCm / 2.54)}″`} />
              <Row label="Allergies" value={p.allergies.join(', ') || 'None'} />
              <Row label="Conditions" value={p.conditions.join(', ') || 'None'} />
              <Row label="Medications" value={p.medications.join(', ') || 'None'} />
              <Row label="Goals" value={p.goals.map(titleCase).join(', ')} />
              <Row label="Churn risk" value={titleCase(p.churnRisk)} />
            </dl>
          </Card>

          <Card className="p-5">
            <SectionTitle>Appointments</SectionTitle>
            {appointments.data?.filter((a) => a.status === 'scheduled').map((a) => (
              <div key={a.id} className="mb-3 last:mb-0">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-accent" />
                  <p className="text-bodySm font-semibold text-ink">{titleCase(a.type)}</p>
                </div>
                <p className="ml-6 text-caption text-ink-muted">
                  {formatShortDate(a.startsAt)} · {formatTime(a.startsAt)}
                </p>
              </div>
            ))}
            {appointments.data?.every((a) => a.status !== 'scheduled') && (
              <p className="text-bodySm text-ink-muted">No upcoming appointments.</p>
            )}
          </Card>

          {/* Check-in trends mini */}
          {checkIns.data && checkIns.data.length > 0 && (
            <Card className="p-5">
              <SectionTitle>Daily check-ins</SectionTitle>
              <div className="space-y-2 text-bodySm">
                {(['energy', 'sleep', 'mood', 'appetite'] as const).map((k) => {
                  const avg =
                    checkIns.data.reduce((sum, c) => sum + (c[k] as number), 0) / checkIns.data.length;
                  return (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-ink-secondary">{titleCase(k)}</span>
                      <span className="font-semibold text-ink">{avg.toFixed(1)} / 5</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Mini({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'danger' | 'warning' | 'success' | 'brand';
}) {
  const toneClass = {
    danger: 'text-danger',
    warning: 'text-warning',
    success: 'text-success',
    brand: 'text-primary',
  };
  return (
    <div>
      <p className="text-overline font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={`font-display text-h2 ${tone ? toneClass[tone] : 'text-ink'}`}>{value}</p>
      {hint && <p className="text-caption text-ink-muted">{hint}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}

function AdherencePanel({ patientId }: { patientId: string }) {
  const occurrences = useOccurrences(patientId);
  const doseLogs = useDoseLogs(patientId);
  const products = useProducts();
  if (!occurrences.data) return <Loading />;

  const sorted = [...occurrences.data].sort(
    (a, b) => +new Date(b.scheduledFor) - +new Date(a.scheduledFor),
  );
  const productName = (id: string) => products.data?.find((p) => p.id === id)?.name ?? '';
  const siteFor = (id: string) => doseLogs.data?.find((l) => l.occurrenceId === id)?.site;

  return (
    <Card className="p-5">
      <SectionTitle>Dose timeline</SectionTitle>
      <div className="space-y-0">
        {sorted.slice(0, 18).map((o, idx) => (
          <div
            key={o.id}
            className={`flex items-center gap-3 py-3 ${idx > 0 ? 'border-t border-border' : ''}`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                o.status === 'taken' ? 'bg-success-soft' : o.status === 'missed' ? 'bg-danger-soft' : 'bg-surface-sunken'
              }`}
            >
              <Syringe
                size={16}
                className={
                  o.status === 'taken' ? 'text-success' : o.status === 'missed' ? 'text-danger' : 'text-ink-muted'
                }
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">{productName(o.productId)}</p>
              <p className="text-caption text-ink-muted">
                {formatShortDate(o.scheduledFor)} · {formatTime(o.scheduledFor)} · {formatDose(o.dose)}
                {siteFor(o.id) ? ` · ${titleCase(siteFor(o.id)!)}` : ''}
              </p>
            </div>
            <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

function OutcomesPanel({ series, patient }: { series: OutcomeSeries[]; patient: { startWeightKg: number; currentWeightKg: number; goalWeightKg?: number } }) {
  // Only surface clinically chartable metrics. Energy and sleep are self-reported
  // and not grounded enough for a clinical view.
  const clinical = series.filter((s) => s.kind !== 'energy' && s.kind !== 'sleep');
  if (clinical.length === 0) return <Card className="p-5"><p className="text-ink-muted">No outcome data yet.</p></Card>;
  const lost = patient.startWeightKg - patient.currentWeightKg;
  return (
    <div className="space-y-5">
      {patient.goalWeightKg && (
        <Card className="p-5">
          <SectionTitle>
            <span className="inline-flex items-center gap-2">
              <TrendingDown size={18} className="text-success" /> Weight goal progress
            </span>
          </SectionTitle>
          <div className="mb-3 flex items-end justify-between">
            <Mini label="Start" value={formatWeight(patient.startWeightKg)} />
            <Mini label="Now" value={formatWeight(patient.currentWeightKg)} tone="success" />
            <Mini label="Goal" value={formatWeight(patient.goalWeightKg)} />
          </div>
          <ProgressBar value={Math.min(1, lost / (patient.startWeightKg - patient.goalWeightKg))} tone="success" />
        </Card>
      )}
      {clinical.map((s) => (
        <Card key={s.kind} className="p-5">
          <SectionTitle>
            <span className="inline-flex items-center gap-2">
              <Activity size={18} className="text-primary" /> {s.label}
            </span>
          </SectionTitle>
          <TrendChart data={s.points.map((p) => ({ x: p.date, y: p.value }))} unit={` ${s.unit}`} />
        </Card>
      ))}
    </div>
  );
}
