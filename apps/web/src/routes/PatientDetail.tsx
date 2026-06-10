import { useRef, useState } from 'react';
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
  Paperclip,
  Pencil,
  Pill,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Syringe,
  TrendingDown,
  TriangleAlert,
  User,
  X,
} from 'lucide-react';
import { daysUntil } from '@beacon/calculations';
import type {
  ClinicDocument,
  DocumentKind,
  DoseStatus,
  FileAttachment,
  LabPanel,
  LabValue,
  OutcomeSeries,
} from '@beacon/domain';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Field,
  Input,
  Loading,
  PageHeader,
  ProgressBar,
  SectionTitle,
  Select,
  Tabs,
  Textarea,
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
  useAddDocument,
  useAppointments,
  useCheckIns,
  useDocuments,
  useDoseLogs,
  useLabs,
  useOccurrences,
  useOrderLabPanel,
  useOutcomes,
  usePatient,
  usePatientThreads,
  useProducts,
  useProtocol,
  useReleaseLabPanel,
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
            <Link to={`/protocols/generate?patient=${p.id}`}>
              <Button variant="secondary" icon={<Sparkles size={15} />}>
                Generate protocol
              </Button>
            </Link>
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
          {tab === 'labs' && <LabsPanel patientId={id} />}
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
              <Row label="Goals" value={p.goals.map(titleCase).join(', ')} />
              <Row label="Churn risk" value={titleCase(p.churnRisk)} />
            </dl>
          </Card>

          {/* Clinical context — drives the AI protocol safety screen */}
          <Card className="p-5">
            <SectionTitle
              action={
                <Link
                  to={`/protocols/generate?patient=${p.id}`}
                  className="inline-flex items-center gap-1 text-bodySm font-medium text-primary hover:underline"
                >
                  <Sparkles size={14} /> Generate
                </Link>
              }
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={17} className="text-primary" /> Clinical context
              </span>
            </SectionTitle>
            <p className="mb-3 text-caption text-ink-muted">
              Medications, agents, conditions, and allergies the AI generator screens every peptide against.
            </p>
            <div className="space-y-3">
              <ChipRow label="Medications & agents" items={p.medications} />
              <ChipRow label="Conditions" items={p.conditions} />
              <ChipRow label="Allergies" items={p.allergies} tone="warning" />
            </div>
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

function ChipRow({
  label,
  items,
  tone = 'neutral',
}: {
  label: string;
  items: string[];
  tone?: 'neutral' | 'warning';
}) {
  return (
    <div>
      <p className="mb-1.5 text-overline font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      {items.length === 0 ? (
        <p className="text-bodySm text-ink-muted">None on file</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) => (
            <Badge key={it} tone={tone}>
              {it}
            </Badge>
          ))}
        </div>
      )}
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

/* ------------------------------ Labs & docs ------------------------------ */

const COMMON_PANELS = [
  'Comprehensive Metabolic Panel',
  'Lipid Panel',
  'CBC with Differential',
  'HbA1c',
  'Thyroid Panel (TSH, Free T4)',
  'Testosterone, Total & Free',
  'IGF-1',
];

const DOCUMENT_KINDS: { value: DocumentKind; label: string }[] = [
  { value: 'consent', label: 'Consent form' },
  { value: 'care_plan', label: 'Care plan' },
  { value: 'instructions', label: 'Instructions' },
  { value: 'visit_summary', label: 'Visit summary' },
  { value: 'other', label: 'Other' },
];

function LabsPanel({ patientId }: { patientId: string }) {
  const labs = useLabs(patientId);
  const documents = useDocuments(patientId);
  const [orderOpen, setOrderOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [reviewPanel, setReviewPanel] = useState<LabPanel | null>(null);

  const needsReview = labs.data?.filter((p) => p.status === 'resulted') ?? [];
  const openOrders = labs.data?.filter((p) => p.status === 'ordered' || p.status === 'collected') ?? [];
  const released = labs.data?.filter((p) => p.status === 'released') ?? [];

  return (
    <>
      <Card className="p-5">
        <SectionTitle
          action={
            <Button size="sm" variant="secondary" icon={<Plus size={15} />} onClick={() => setOrderOpen(true)}>
              Order panel
            </Button>
          }
        >
          Labs
        </SectionTitle>

        {needsReview.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-overline font-semibold uppercase tracking-wide text-amber-700">
              Needs review
            </p>
            <div className="space-y-3">
              {needsReview.map((panel) => (
                <div key={panel.id} className="rounded-xl border border-warning/50 bg-warning-soft/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{panel.name}</p>
                      <p className="text-caption text-ink-muted">
                        {panel.resultedOn ? `Resulted ${formatShortDate(panel.resultedOn)}` : `Ordered ${formatShortDate(panel.orderedOn)}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {panel.source === 'patient' && <Badge tone="accent">Patient upload</Badge>}
                      <Button size="sm" onClick={() => setReviewPanel(panel)}>
                        Review &amp; release
                      </Button>
                    </div>
                  </div>
                  {panel.attachment && <AttachmentLine fileName={panel.attachment.fileName} sizeKb={panel.attachment.sizeKb} />}
                  <LabValueGrid values={panel.values} />
                </div>
              ))}
            </div>
          </div>
        )}

        {openOrders.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-overline font-semibold uppercase tracking-wide text-ink-muted">
              Open orders
            </p>
            <div className="space-y-2">
              {openOrders.map((panel) => (
                <div key={panel.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <FlaskConical size={18} className="text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{panel.name}</p>
                    <p className="text-caption text-ink-muted">
                      Ordered {formatShortDate(panel.orderedOn)} · Patient can upload results from the app
                    </p>
                  </div>
                  <Badge>{titleCase(panel.status)}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => setReviewPanel(panel)}>
                    Enter results
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {released.map((panel) => (
          <div key={panel.id} className="mb-4 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink">{panel.name}</p>
                <p className="text-caption text-ink-muted">
                  {panel.resultedOn ? `Resulted ${formatShortDate(panel.resultedOn)}` : `Ordered ${formatShortDate(panel.orderedOn)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {panel.source === 'patient' && <Badge tone="accent">Patient upload</Badge>}
                <Badge tone="success">Released</Badge>
              </div>
            </div>
            {panel.attachment && <AttachmentLine fileName={panel.attachment.fileName} sizeKb={panel.attachment.sizeKb} />}
            <LabValueGrid values={panel.values} />
            {panel.providerComment && (
              <p className="mt-3 rounded-lg bg-surface-sunken p-3 text-bodySm text-ink-secondary">
                {panel.providerComment}
              </p>
            )}
          </div>
        ))}

        {labs.data && labs.data.length === 0 && (
          <p className="py-3 text-bodySm text-ink-muted">
            No labs yet. Order a panel to get the patient started.
          </p>
        )}

        <SectionTitle
          action={
            <Button size="sm" variant="secondary" icon={<Plus size={15} />} onClick={() => setDocOpen(true)}>
              Add document
            </Button>
          }
        >
          Documents
        </SectionTitle>
        <div className="space-y-2">
          {documents.data?.map((d) => (
            <DocumentLine key={d.id} doc={d} />
          ))}
          {documents.data && documents.data.length === 0 && (
            <p className="py-3 text-bodySm text-ink-muted">No documents on file.</p>
          )}
        </div>
      </Card>

      <OrderPanelDialog open={orderOpen} onClose={() => setOrderOpen(false)} patientId={patientId} />
      <AddDocumentDialog open={docOpen} onClose={() => setDocOpen(false)} patientId={patientId} />
      {reviewPanel && (
        <ReviewLabDialog
          patientId={patientId}
          panel={reviewPanel}
          onClose={() => setReviewPanel(null)}
        />
      )}
    </>
  );
}

function fileSizeLabel(sizeKb?: number): string | null {
  if (!sizeKb) return null;
  return sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
}

function AttachmentLine({ fileName, sizeKb }: { fileName: string; sizeKb?: number }) {
  const size = fileSizeLabel(sizeKb);
  return (
    <p className="mt-2 inline-flex items-center gap-1.5 text-bodySm text-ink-secondary">
      <Paperclip size={14} className="text-ink-muted" />
      {fileName}
      {size ? <span className="text-ink-muted">· {size}</span> : null}
    </p>
  );
}

/**
 * Provider-side file attach. Like the rest of the prototype it keeps metadata
 * only (name + size) — no bytes are stored or uploaded anywhere.
 */
function FileField({
  value,
  onChange,
  label,
}: {
  value: FileAttachment | null;
  onChange: (file: FileAttachment | null) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange({ fileName: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) });
          e.target.value = '';
        }}
      />
      {value ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-sunken px-3 py-2.5">
          <Paperclip size={15} className="shrink-0 text-ink-muted" />
          <span className="min-w-0 flex-1 truncate text-bodySm text-ink-secondary">
            {value.fileName}
            {fileSizeLabel(value.sizeKb) ? (
              <span className="text-ink-muted"> · {fileSizeLabel(value.sizeKb)}</span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 text-ink-muted hover:text-ink"
            aria-label="Remove file"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          icon={<Paperclip size={15} />}
          onClick={() => inputRef.current?.click()}
        >
          {label}
        </Button>
      )}
    </div>
  );
}

function LabValueGrid({ values }: { values: LabValue[] }) {
  if (values.length === 0) return null;
  return (
    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-bodySm">
      {values.map((v) => (
        <div key={v.name} className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
          <span className="text-ink-secondary">{v.name}</span>
          <span className={v.flag === 'normal' ? 'text-ink' : 'text-danger'}>
            {v.value} {v.unit}
          </span>
        </div>
      ))}
    </div>
  );
}

function DocumentLine({ doc }: { doc: ClinicDocument }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <FileText size={18} className="text-primary" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{doc.title}</p>
        <p className="truncate text-caption text-ink-muted">
          {titleCase(doc.kind)} · {formatShortDate(doc.createdAt)}
          {doc.attachment ? ` · ${doc.attachment.fileName}` : ''}
        </p>
      </div>
      {doc.source === 'patient' && <Badge tone="accent">Patient upload</Badge>}
      {doc.requiresSignature ? (
        <Badge tone={doc.signed ? 'success' : 'warning'}>
          {doc.signed ? 'Signed' : 'Awaiting signature'}
        </Badge>
      ) : (
        <Badge>On file</Badge>
      )}
    </div>
  );
}

function OrderPanelDialog({
  open,
  onClose,
  patientId,
}: {
  open: boolean;
  onClose: () => void;
  patientId: string;
}) {
  const order = useOrderLabPanel();
  const [choice, setChoice] = useState(COMMON_PANELS[0]);
  const [custom, setCustom] = useState('');
  const name = choice === 'custom' ? custom.trim() : choice;

  const submit = () => {
    if (!name) return;
    order.mutate(
      { patientId, name },
      {
        onSuccess: () => {
          setChoice(COMMON_PANELS[0]);
          setCustom('');
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="Order lab panel">
      <div className="space-y-4">
        <Field label="Panel">
          <Select value={choice} onChange={(e) => setChoice(e.target.value)}>
            {COMMON_PANELS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="custom">Custom…</option>
          </Select>
        </Field>
        {choice === 'custom' && (
          <Field label="Panel name">
            <Input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. Vitamin D, 25-Hydroxy"
              autoFocus
            />
          </Field>
        )}
        <p className="text-bodySm text-ink-muted">
          The patient sees this under “Requested by your clinic” in the app and can upload
          their results directly.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!name || order.isPending} onClick={submit}>
            {order.isPending ? 'Ordering…' : 'Order panel'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

interface ValueDraft {
  name: string;
  value: string;
  unit: string;
  refLow: string;
  refHigh: string;
}

const EMPTY_DRAFT: ValueDraft = { name: '', value: '', unit: '', refLow: '', refHigh: '' };

function ReviewLabDialog({
  patientId,
  panel,
  onClose,
}: {
  patientId: string;
  panel: LabPanel;
  onClose: () => void;
}) {
  const release = useReleaseLabPanel(patientId);
  const [rows, setRows] = useState<ValueDraft[]>(
    panel.values.length > 0
      ? panel.values.map((v) => ({
          name: v.name,
          value: String(v.value),
          unit: v.unit,
          refLow: String(v.refLow),
          refHigh: String(v.refHigh),
        }))
      : [{ ...EMPTY_DRAFT }],
  );
  const [comment, setComment] = useState(panel.providerComment ?? '');
  const [file, setFile] = useState<FileAttachment | null>(panel.attachment ?? null);

  const setRow = (idx: number, patch: Partial<ValueDraft>) =>
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const parsed: LabValue[] = rows
    .filter((r) => r.name.trim() && r.value.trim() !== '' && !Number.isNaN(Number(r.value)))
    .map((r) => {
      const value = Number(r.value);
      const refLow = Number(r.refLow) || 0;
      const refHigh = Number(r.refHigh) || 0;
      const flag: LabValue['flag'] =
        refHigh > 0 && value > refHigh ? 'high' : value < refLow ? 'low' : 'normal';
      return { name: r.name.trim(), value, unit: r.unit.trim(), refLow, refHigh, flag };
    });

  const canRelease = (parsed.length > 0 || comment.trim().length > 0) && !release.isPending;

  const submit = () =>
    release.mutate(
      { panelId: panel.id, values: parsed, providerComment: comment, attachment: file ?? undefined },
      { onSuccess: onClose },
    );

  const fromPatient = panel.source === 'patient';

  return (
    <Dialog open onClose={onClose} title={`Review — ${panel.name}`} width="max-w-2xl">
      <div className="space-y-4">
        <Field
          label="Result file"
          hint={
            fromPatient
              ? 'The patient uploaded this. Transcribe the values below, then release.'
              : 'Attach the lab’s result PDF (Quest, Labcorp, etc.), then transcribe the values below.'
          }
        >
          <FileField value={file} onChange={setFile} label="Attach result PDF or image" />
        </Field>

        <div>
          <div className="mb-1.5 grid grid-cols-[1fr_72px_64px_64px_64px] gap-2 text-caption font-semibold text-ink-muted">
            <span>Marker</span>
            <span>Value</span>
            <span>Unit</span>
            <span>Ref low</span>
            <span>Ref high</span>
          </div>
          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_72px_64px_64px_64px] gap-2">
                <Input
                  value={row.name}
                  onChange={(e) => setRow(idx, { name: e.target.value })}
                  placeholder="e.g. Glucose"
                />
                <Input
                  value={row.value}
                  onChange={(e) => setRow(idx, { value: e.target.value })}
                  inputMode="decimal"
                />
                <Input value={row.unit} onChange={(e) => setRow(idx, { unit: e.target.value })} />
                <Input
                  value={row.refLow}
                  onChange={(e) => setRow(idx, { refLow: e.target.value })}
                  inputMode="decimal"
                />
                <Input
                  value={row.refHigh}
                  onChange={(e) => setRow(idx, { refHigh: e.target.value })}
                  inputMode="decimal"
                />
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            icon={<Plus size={14} />}
            onClick={() => setRows((rs) => [...rs, { ...EMPTY_DRAFT }])}
          >
            Add marker
          </Button>
        </div>

        <Field label="Comment for the patient" hint="Shown with the results in the patient app.">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Lipids trending the right way — keep the current protocol."
          />
        </Field>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!canRelease} onClick={submit}>
            {release.isPending ? 'Releasing…' : 'Release to patient'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function AddDocumentDialog({
  open,
  onClose,
  patientId,
}: {
  open: boolean;
  onClose: () => void;
  patientId: string;
}) {
  const addDocument = useAddDocument();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<DocumentKind>('consent');
  const [requiresSignature, setRequiresSignature] = useState(true);
  const [file, setFile] = useState<FileAttachment | null>(null);

  const pickKind = (value: DocumentKind) => {
    setKind(value);
    setRequiresSignature(value === 'consent' || value === 'care_plan');
  };

  // Attaching a file means this is an existing record being filed, not a form to
  // generate and e-sign — so default the signature request off.
  const pickFile = (next: FileAttachment | null) => {
    setFile(next);
    if (next) setRequiresSignature(false);
  };

  const submit = () => {
    if (!title.trim()) return;
    addDocument.mutate(
      { patientId, title: title.trim(), kind, requiresSignature, attachment: file ?? undefined },
      {
        onSuccess: () => {
          setTitle('');
          pickKind('consent');
          setFile(null);
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add document">
      <div className="space-y-4">
        <Field label="Title">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Telehealth Consent"
            autoFocus
          />
        </Field>
        <Field label="Type">
          <Select value={kind} onChange={(e) => pickKind(e.target.value as DocumentKind)}>
            {DOCUMENT_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Attach a file (optional)"
          hint="For external or scanned records — a referral letter, visit summary, or signed paper form."
        >
          <FileField value={file} onChange={pickFile} label="Attach a PDF or image" />
        </Field>
        <label className="flex items-center gap-2.5 text-bodySm text-ink">
          <input
            type="checkbox"
            checked={requiresSignature}
            onChange={(e) => setRequiresSignature(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Request the patient’s signature in the app
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!title.trim() || addDocument.isPending} onClick={submit}>
            {addDocument.isPending ? 'Adding…' : 'Add document'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
