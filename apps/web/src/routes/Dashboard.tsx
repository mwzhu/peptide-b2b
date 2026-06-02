import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ChevronRight,
  HeartPulse,
  MessageSquare,
  Package,
  Stethoscope,
  TriangleAlert,
  Users,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Loading,
  PageHeader,
  SectionTitle,
  Stat,
} from '../components/ui';
import { formatShortDate, fullName, relativeTime, titleCase } from '../lib/format';
import {
  useAnalytics,
  useAuditEvents,
  usePatients,
  useRefills,
  useThreads,
  useTriageCases,
} from '../lib/hooks';

export function Dashboard() {
  const analytics = useAnalytics();
  const patients = usePatients();
  const triage = useTriageCases();
  const refills = useRefills();
  const threads = useThreads();
  const audit = useAuditEvents();

  if (!analytics.data || !patients.data) return <Loading />;

  const a = analytics.data;
  const messagesPending =
    threads.data?.filter((t) => t.unread || t.urgent).length ?? 0;
  const refillsThisWeek =
    refills.data?.filter(
      (r) =>
        r.status === 'requested' ||
        r.status === 'under_review' ||
        r.status === 'awaiting_payment',
    ).length ?? 0;

  const pendingRefills = (refills.data ?? []).filter(
    (r) => r.status === 'requested' || r.status === 'under_review',
  );

  // Compose a unified "Needs attention" list from three signals:
  //   1. Open / escalated triage cases (red-flag symptoms)
  //   2. Patients flagged needs_attention
  //   3. High-churn-risk patients with low adherence
  const openTriage = (triage.data ?? []).filter(
    (t) => t.status === 'new' || t.status === 'escalated',
  );
  type AttentionRow = {
    id: string;
    patientId: string;
    severity: 'critical' | 'high' | 'medium';
    reason: string;
    detail: string;
    since: string;
  };
  const attention: AttentionRow[] = [];
  const seen = new Set<string>();

  for (const t of openTriage) {
    if (seen.has(t.patientId)) continue;
    seen.add(t.patientId);
    attention.push({
      id: t.id,
      patientId: t.patientId,
      severity: t.severity === 'severe' ? 'critical' : 'high',
      reason: t.summary,
      detail: `SLA ${relativeTime(t.slaDueAt)} · ${titleCase(t.status)}`,
      since: t.openedAt,
    });
  }
  for (const p of patients.data) {
    if (seen.has(p.id)) continue;
    if (p.status === 'needs_attention') {
      seen.add(p.id);
      attention.push({
        id: `att-${p.id}`,
        patientId: p.id,
        severity: 'high',
        reason: 'Flagged for clinical review',
        detail: `${Math.round(p.adherence30d * 100)}% adherence over 30 days`,
        since: p.enrolledAt,
      });
    } else if (p.churnRisk === 'high') {
      seen.add(p.id);
      attention.push({
        id: `att-${p.id}`,
        patientId: p.id,
        severity: 'medium',
        reason: 'At risk of churn',
        detail: `${Math.round(p.adherence30d * 100)}% adherence over 30 days`,
        since: p.enrolledAt,
      });
    }
  }

  const newPatients = patients.data.filter((p) => p.status === 'onboarding');
  const patientById = (id: string) => patients.data.find((p) => p.id === id);
  const patientName = (id: string) => {
    const p = patientById(id);
    return p ? fullName(p) : 'Unknown';
  };

  return (
    <>
      <PageHeader
        title="Today at Solstice"
        subtitle="Dashboard"
        actions={
          <>
            <Link to="/patients">
              <Button variant="secondary" icon={<Users size={16} />}>
                Roster
              </Button>
            </Link>
            <Link to="/protocols/builder">
              <Button icon={<ArrowRight size={16} />}>New protocol</Button>
            </Link>
          </>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Stat
          label="Active patients"
          value={`${a.activePatients}`}
          hint={`+${a.newStarts30d} in last 30 days`}
          icon={<Users size={18} className="text-ink-muted" />}
        />
        <Stat
          label="Avg adherence"
          value={`${Math.round(a.avgAdherence * 100)}%`}
          hint="Last 30 days"
          tone="brand"
          icon={<Activity size={18} className="text-ink-muted" />}
        />
        <Stat
          label="Messages pending"
          value={`${messagesPending}`}
          hint={messagesPending > 0 ? 'Unread or urgent' : 'Inbox clear'}
          tone={messagesPending > 5 ? 'warning' : undefined}
          icon={<MessageSquare size={18} className="text-ink-muted" />}
        />
        <Stat
          label="Refills due this week"
          value={`${refillsThisWeek}`}
          hint={refillsThisWeek > 0 ? 'Awaiting review' : 'Nothing pending'}
          tone={refillsThisWeek > 0 ? 'warning' : undefined}
          icon={<Package size={18} className="text-ink-muted" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-5">
        {/* Primary worklist */}
        <div className="col-span-2 space-y-5">
          {/* Needs attention — promoted, large, dense */}
          <Card className="p-6">
            <SectionTitle
              action={
                <span className="text-bodySm text-ink-muted">
                  {attention.length} {attention.length === 1 ? 'patient' : 'patients'}
                </span>
              }
            >
              <span className="inline-flex items-center gap-2">
                <HeartPulse size={20} className="text-warning" /> Needs attention
              </span>
            </SectionTitle>
            {attention.length === 0 ? (
              <p className="py-8 text-center text-bodySm text-ink-muted">
                No patients flagged. Nice work.
              </p>
            ) : (
              <div className="space-y-0">
                {attention.map((row, idx) => {
                  const p = patientById(row.patientId);
                  const tone = row.severity === 'critical' ? 'danger' : row.severity === 'high' ? 'warning' : 'neutral';
                  const Icon = row.severity === 'critical' ? Stethoscope : TriangleAlert;
                  return (
                    <Link
                      key={row.id}
                      to={`/patients/${row.patientId}`}
                      className={`-mx-2 flex items-center gap-4 rounded-xl px-2 py-4 hover:bg-sand-100 ${
                        idx > 0 ? 'border-t border-border' : ''
                      }`}
                    >
                      {p && <Avatar name={fullName(p)} hue={p.avatarHue} size={44} />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <p className="truncate text-body font-semibold text-ink">
                            {patientName(row.patientId)}
                          </p>
                          <Badge tone={tone} dot>
                            {row.severity}
                          </Badge>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1.5 text-bodySm text-ink-secondary">
                          <Icon size={14} className={tone === 'danger' ? 'text-danger' : 'text-warning'} />
                          {row.reason}
                        </p>
                        <p className="mt-0.5 text-caption text-ink-muted">{row.detail}</p>
                      </div>
                      <ChevronRight size={18} className="text-ink-muted" />
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Refill queue */}
          <Card className="p-5">
            <SectionTitle
              action={
                <Link to="/refills" className="text-bodySm font-medium text-primary hover:underline">
                  View all →
                </Link>
              }
            >
              <span className="inline-flex items-center gap-2">
                <Package size={18} className="text-primary" /> Refill requests
              </span>
            </SectionTitle>
            {pendingRefills.length === 0 ? (
              <p className="py-6 text-center text-bodySm text-ink-muted">No refill requests pending.</p>
            ) : (
              <div className="space-y-0">
                {pendingRefills.slice(0, 5).map((r, idx) => (
                  <Link
                    key={r.id}
                    to="/refills"
                    className={`-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-sand-100 ${
                      idx > 0 ? 'border-t border-border' : ''
                    }`}
                  >
                    {patientById(r.patientId) && (
                      <Avatar
                        name={patientName(r.patientId)}
                        hue={patientById(r.patientId)!.avatarHue}
                        size={36}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{patientName(r.patientId)}</p>
                      <p className="truncate text-bodySm text-ink-muted">
                        Requested {relativeTime(r.requestedAt)}
                      </p>
                    </div>
                    <Badge tone={r.eligible ? 'success' : 'warning'}>
                      {r.eligible ? 'Eligible' : 'Needs review'}
                    </Badge>
                    <ChevronRight size={16} className="text-ink-muted" />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* New patients */}
          <Card className="p-5">
            <SectionTitle>Onboarding</SectionTitle>
            {newPatients.length === 0 ? (
              <p className="py-4 text-center text-bodySm text-ink-muted">No new patients.</p>
            ) : (
              newPatients.map((p) => (
                <Link
                  key={p.id}
                  to={`/patients/${p.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-sand-100"
                >
                  <Avatar name={fullName(p)} hue={p.avatarHue} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-bodySm font-semibold text-ink">{fullName(p)}</p>
                    <p className="text-caption text-ink-muted">Joined {formatShortDate(p.enrolledAt)}</p>
                  </div>
                  <Badge tone="brand">New</Badge>
                </Link>
              ))
            )}
          </Card>

          {/* Recent activity */}
          <Card className="p-5">
            <SectionTitle>Recent activity</SectionTitle>
            <div className="space-y-3">
              {(audit.data ?? []).slice(0, 7).map((e) => (
                <div key={e.id} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-bodySm text-ink">
                      <span className="font-medium">{e.actorName}</span>{' '}
                      <span className="text-ink-muted">{e.action}</span>
                    </p>
                    <p className="truncate text-caption text-ink-muted">
                      {e.resourceLabel} · {relativeTime(e.at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
