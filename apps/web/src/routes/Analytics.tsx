import { Activity, Package, Users } from 'lucide-react';
import { BarsChart, TrendChart } from '../components/Chart';
import { Card, Loading, PageHeader, SectionTitle, Stat } from '../components/ui';
import { useAnalytics } from '../lib/hooks';

export function Analytics() {
  const analytics = useAnalytics();
  if (!analytics.data) return <Loading />;
  const a = analytics.data;

  return (
    <>
      <PageHeader title="Clinic analytics" subtitle="Operations" />

      <div className="grid grid-cols-3 gap-4">
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
          label="Refill conversion"
          value={`${Math.round(a.refillConversion * 100)}%`}
          hint="Approved & shipped vs. requested"
          icon={<Package size={18} className="text-ink-muted" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionTitle>Adherence over time</SectionTitle>
          <TrendChart
            data={a.adherenceTrend.map((p) => ({ x: p.date, y: Math.round(p.value * 100) }))}
            unit="%"
            height={240}
          />
          <p className="mt-3 text-caption text-ink-muted">
            Rolling clinic-wide adherence, recomputed from logged doses each week.
          </p>
        </Card>
        <Card className="p-5">
          <SectionTitle>Patients by protocol</SectionTitle>
          <BarsChart
            data={a.protocolPopularity.map((p) => ({
              label: p.name.split(' ')[0]!,
              value: p.count,
            }))}
            height={240}
          />
          <p className="mt-3 text-caption text-ink-muted">
            Active assignments per protocol template — a proxy for retention by protocol.
          </p>
        </Card>
      </div>
    </>
  );
}
