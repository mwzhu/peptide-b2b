import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Check,
  CircleAlert,
  Package,
  Send,
  Truck,
} from 'lucide-react';
import type { RefillStatus } from '@beacon/domain';
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
import { formatShortDate, fullName, relativeTime, titleCase } from '../lib/format';
import { useAdvanceRefill, usePatients, useProducts, useRefills } from '../lib/hooks';

const STATUS_TONE: Record<RefillStatus, 'warning' | 'brand' | 'success' | 'info' | 'danger' | 'neutral'> = {
  requested: 'warning',
  under_review: 'brand',
  approved: 'success',
  awaiting_payment: 'warning',
  sent_to_pharmacy: 'info',
  shipped: 'info',
  delivered: 'success',
  denied: 'danger',
};

export function Refills() {
  const refills = useRefills();
  const patients = usePatients();
  const products = useProducts();
  const advance = useAdvanceRefill();
  const [filter, setFilter] = useState<'pending' | 'in_progress' | 'completed' | 'all'>('pending');
  const [selectedId, setSelectedId] = useState<string | undefined>();

  if (!refills.data || !patients.data) return <Loading />;

  const patientById = (id: string) => patients.data.find((p) => p.id === id);
  const productName = (id: string) => products.data?.find((p) => p.id === id)?.name ?? 'Peptide';

  const sorted = [...refills.data].sort(
    (a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt),
  );
  const filtered = sorted.filter((r) => {
    if (filter === 'pending') return r.status === 'requested' || r.status === 'under_review' || r.status === 'awaiting_payment';
    if (filter === 'in_progress') return r.status === 'approved' || r.status === 'sent_to_pharmacy' || r.status === 'shipped';
    if (filter === 'completed') return r.status === 'delivered' || r.status === 'denied';
    return true;
  });

  const counts = {
    pending: sorted.filter((r) => r.status === 'requested' || r.status === 'under_review' || r.status === 'awaiting_payment').length,
    in_progress: sorted.filter((r) => r.status === 'approved' || r.status === 'sent_to_pharmacy' || r.status === 'shipped').length,
    completed: sorted.filter((r) => r.status === 'delivered' || r.status === 'denied').length,
    all: sorted.length,
  };

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0];

  return (
    <>
      <PageHeader title="Refills & orders" subtitle="Order operations" />

      <Tabs
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: 'pending', label: 'Pending review', count: counts.pending },
          { value: 'in_progress', label: 'In progress', count: counts.in_progress },
          { value: 'completed', label: 'Completed', count: counts.completed },
          { value: 'all', label: 'All', count: counts.all },
        ]}
      />

      <div className="mt-6 grid grid-cols-[1fr_1.4fr] gap-5">
        {/* List */}
        <Card>
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-bodySm text-ink-muted">Nothing here.</p>
          ) : (
            filtered.map((r, idx) => {
              const p = patientById(r.patientId);
              const isActive = selected?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left px-5 py-4 ${idx > 0 ? 'border-t border-border' : ''} ${
                    isActive ? 'bg-primary-soft/60' : 'hover:bg-sand-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {p && <Avatar name={fullName(p)} hue={p.avatarHue} size={36} />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-ink">{p ? fullName(p) : 'Unknown'}</p>
                        <Badge tone={STATUS_TONE[r.status]} dot>
                          {titleCase(r.status)}
                        </Badge>
                      </div>
                      <p className="truncate text-bodySm text-ink-muted">{productName(r.productId)}</p>
                      <p className="text-caption text-ink-muted">
                        {r.eligible ? 'Eligible' : 'Eligibility issues'} · requested {relativeTime(r.requestedAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </Card>

        {/* Detail */}
        {selected && (
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const p = patientById(selected.patientId);
                  return p ? (
                    <>
                      <Avatar name={fullName(p)} hue={p.avatarHue} size={44} />
                      <div>
                        <Link to={`/patients/${p.id}`} className="font-display text-h3 text-ink hover:underline">
                          {fullName(p)}
                        </Link>
                        <p className="text-bodySm text-ink-muted">{productName(selected.productId)}</p>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
              <Badge tone={STATUS_TONE[selected.status]} dot>
                {titleCase(selected.status)}
              </Badge>
            </div>

            {/* Eligibility */}
            <div className="mt-6">
              <SectionTitle>Eligibility checks</SectionTitle>
              <div className="space-y-2">
                {selected.eligibility.map((e) => (
                  <div
                    key={e.rule}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      e.passed ? 'border-success-soft bg-success-soft/40' : 'border-warning-soft bg-warning-soft/40'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        e.passed ? 'bg-success text-primary-on' : 'bg-warning text-primary-on'
                      }`}
                    >
                      {e.passed ? <Check size={13} strokeWidth={3} /> : '!'}
                    </div>
                    <div className="flex-1">
                      <p className="text-bodySm font-semibold text-ink">{e.label}</p>
                      <p className="text-caption text-ink-muted">{e.detail}</p>
                    </div>
                    {e.blocking && !e.passed && <Badge tone="danger">Blocking</Badge>}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 border-t border-border pt-5">
              <SectionTitle>Next steps</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {(selected.status === 'requested' || selected.status === 'under_review') && (
                  <>
                    <Button
                      icon={<Check size={15} />}
                      onClick={() => advance.mutate({ refillId: selected.id, status: 'approved' })}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      icon={<Send size={15} />}
                      onClick={() => advance.mutate({ refillId: selected.id, status: 'awaiting_payment' })}
                    >
                      Send payment link
                    </Button>
                    <Button
                      variant="danger"
                      icon={<CircleAlert size={15} />}
                      onClick={() => advance.mutate({ refillId: selected.id, status: 'denied' })}
                    >
                      Deny
                    </Button>
                  </>
                )}
                {selected.status === 'approved' && (
                  <>
                    <Button
                      icon={<Building2 size={15} />}
                      onClick={() =>
                        advance.mutate({ refillId: selected.id, status: 'sent_to_pharmacy', fulfillment: 'in_house' })
                      }
                    >
                      Fulfill in-house
                    </Button>
                    <Button
                      variant="secondary"
                      icon={<Send size={15} />}
                      onClick={() =>
                        advance.mutate({ refillId: selected.id, status: 'sent_to_pharmacy', fulfillment: 'pharmacy' })
                      }
                    >
                      Send to pharmacy
                    </Button>
                  </>
                )}
                {selected.status === 'sent_to_pharmacy' && (
                  <Button
                    icon={<Truck size={15} />}
                    onClick={() => advance.mutate({ refillId: selected.id, status: 'shipped' })}
                  >
                    Mark shipped
                  </Button>
                )}
                {selected.status === 'shipped' && (
                  <Button
                    icon={<Check size={15} />}
                    onClick={() => advance.mutate({ refillId: selected.id, status: 'delivered' })}
                  >
                    Mark delivered
                  </Button>
                )}
              </div>
            </div>

            {/* Fulfillment hint */}
            <div className="mt-6 rounded-xl bg-sand-50 border border-border p-4">
              <div className="flex items-start gap-3">
                <Package size={18} className="mt-0.5 text-primary" />
                <div className="flex-1 text-bodySm text-ink-secondary">
                  Beacon supports two fulfillment paths. <strong>In-house</strong> deducts a vial
                  from your inventory ledger and generates a dispense record. <strong>Pharmacy</strong>{' '}
                  produces a structured order export for your compounding partner — pharmacy API
                  integrations land in Phase 3.
                </div>
              </div>
            </div>

            <p className="mt-5 text-caption text-ink-muted">
              Requested {formatShortDate(selected.requestedAt)}{' '}
              {selected.fulfillment ? `· ${titleCase(selected.fulfillment)} fulfillment` : ''}
              {selected.trackingNumber ? ` · Tracking ${selected.trackingNumber}` : ''}
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
