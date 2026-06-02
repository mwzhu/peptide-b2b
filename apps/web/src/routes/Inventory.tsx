import { useMemo, useState } from 'react';
import { AlertTriangle, Boxes, CircleAlert, Filter, Package, Plus } from 'lucide-react';
import { daysUntil } from '@beacon/calculations';
import type { LotStatus } from '@beacon/domain';
import {
  Badge,
  Button,
  Card,
  Loading,
  PageHeader,
  Stat,
  Tabs,
} from '../components/ui';
import { formatShortDate, titleCase } from '../lib/format';
import { useClinic, useInventory, useProducts } from '../lib/hooks';

const STATUS_TONE: Record<LotStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  in_stock: 'success',
  low: 'warning',
  expiring: 'warning',
  recalled: 'danger',
  depleted: 'neutral',
};

export function Inventory() {
  const inventory = useInventory();
  const products = useProducts();
  const clinic = useClinic();
  const [location, setLocation] = useState<'all' | string>('all');

  const filtered = useMemo(() => {
    if (!inventory.data) return [];
    return location === 'all'
      ? inventory.data
      : inventory.data.filter((l) => l.locationId === location);
  }, [inventory.data, location]);

  if (!inventory.data || !clinic.data) return <Loading />;

  const productName = (id: string) => products.data?.find((p) => p.id === id)?.name ?? 'Peptide';
  const locationName = (id: string) =>
    clinic.data.locations.find((l) => l.id === id)?.name ?? '—';

  const counts = {
    total: inventory.data.reduce((sum, l) => sum + l.quantityOnHand, 0),
    low: inventory.data.filter((l) => l.status === 'low').length,
    expiring: inventory.data.filter((l) => l.status === 'expiring').length,
    recalled: inventory.data.filter((l) => l.status === 'recalled').length,
  };

  const locationTabs = [
    { value: 'all', label: 'All locations', count: inventory.data.length },
    ...clinic.data.locations.map((l) => ({
      value: l.id,
      label: l.name,
      count: inventory.data.filter((row) => row.locationId === l.id).length,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Lots & dispensing"
        actions={
          <>
            <Button variant="secondary" icon={<Filter size={15} />}>
              Filters
            </Button>
            <Button icon={<Plus size={15} />}>Receive shipment</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <Stat label="Vials in stock" value={`${counts.total}`} icon={<Boxes size={18} className="text-ink-muted" />} />
        <Stat label="Low stock" value={`${counts.low}`} tone={counts.low ? 'warning' : undefined} icon={<Package size={18} className="text-ink-muted" />} />
        <Stat label="Expiring soon" value={`${counts.expiring}`} tone={counts.expiring ? 'warning' : undefined} icon={<AlertTriangle size={18} className="text-ink-muted" />} />
        <Stat label="Recalled" value={`${counts.recalled}`} tone={counts.recalled ? 'danger' : undefined} icon={<CircleAlert size={18} className="text-ink-muted" />} />
      </div>

      <Tabs value={location} onChange={(v) => setLocation(v)} tabs={locationTabs} />

      <Card className="mt-6">
        <div className="grid grid-cols-[2fr_1fr_1fr_0.8fr_1fr_1fr_1fr] gap-4 border-b border-border px-5 py-3 text-overline font-semibold uppercase tracking-wide text-ink-muted">
          <span>Product</span>
          <span>Lot #</span>
          <span>Location</span>
          <span>On hand</span>
          <span>Expires</span>
          <span>Status</span>
          <span>Supplier</span>
        </div>
        {filtered.map((lot) => {
          const expIn = daysUntil(lot.expiresOn);
          return (
            <div
              key={lot.id}
              className="grid grid-cols-[2fr_1fr_1fr_0.8fr_1fr_1fr_1fr] items-center gap-4 border-t border-border px-5 py-3.5"
            >
              <div>
                <p className="font-semibold text-ink">{productName(lot.productId)}</p>
                <p className="text-caption text-ink-muted">{lot.quantityReserved} reserved</p>
              </div>
              <span className="font-mono text-bodySm text-ink">{lot.lotNumber}</span>
              <span className="text-bodySm text-ink-secondary">{locationName(lot.locationId)}</span>
              <span className={`text-body font-semibold ${lot.quantityOnHand <= lot.reorderThreshold ? 'text-warning' : 'text-ink'}`}>
                {lot.quantityOnHand}
              </span>
              <div>
                <p className="text-bodySm text-ink">{formatShortDate(lot.expiresOn)}</p>
                <p className={`text-caption ${expIn <= 30 ? 'text-warning' : 'text-ink-muted'}`}>
                  {expIn <= 0 ? 'Expired' : `in ${expIn}d`}
                </p>
              </div>
              <Badge tone={STATUS_TONE[lot.status]} dot>
                {titleCase(lot.status)}
              </Badge>
              <span className="text-bodySm text-ink-secondary">{lot.supplier}</span>
            </div>
          );
        })}
      </Card>

      {counts.recalled > 0 && (
        <Card className="mt-6 border-danger-soft bg-danger-soft/40 p-5">
          <div className="flex items-start gap-3">
            <CircleAlert size={20} className="mt-0.5 text-danger" />
            <div>
              <p className="font-display text-h3 text-ink">Active recall</p>
              <p className="mt-1 text-bodySm text-ink-secondary">
                Lot{' '}
                <span className="font-mono font-semibold">
                  {inventory.data.find((l) => l.status === 'recalled')?.lotNumber}
                </span>{' '}
                has been recalled. Patients who received this lot are flagged automatically and
                their care team has been notified.
              </p>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
