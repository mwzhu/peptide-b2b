import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import type { RefillRequest, RefillStatus } from '@beacon/domain';
import { Check, CircleCheck, CircleX, Package, RefreshCw, Truck } from 'lucide-react-native';
import { color, radius } from '../src/theme';
import {
  Badge,
  Button,
  Card,
  Header,
  IconCircle,
  SectionHeader,
  Screen,
  Text,
} from '../src/components/ui';
import { formatDate, relativeTime, titleCase } from '../src/lib/format';
import { useProducts, useProtocol, useRefills, useRequestRefill } from '../src/lib/hooks';

const FLOW: RefillStatus[] = [
  'requested',
  'under_review',
  'approved',
  'awaiting_payment',
  'sent_to_pharmacy',
  'shipped',
  'delivered',
];

const STATUS_LABEL: Record<RefillStatus, string> = {
  requested: 'Request received',
  under_review: 'Under provider review',
  approved: 'Approved',
  awaiting_payment: 'Awaiting payment',
  sent_to_pharmacy: 'Sent to pharmacy',
  shipped: 'Shipped',
  delivered: 'Delivered',
  denied: 'Not approved',
};

export default function Refills() {
  const params = useLocalSearchParams<{ product?: string; protocol?: string }>();
  const refills = useRefills();
  const products = useProducts();
  const protocol = useProtocol();
  const requestRefill = useRequestRefill();

  if (!refills.data || !products.data) {
    return (
      <Screen header={<Header showBack title="Refills" />}>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const productName = (id: string) => products.data.find((p) => p.id === id)?.name ?? 'Peptide';
  const sorted = [...refills.data].sort(
    (a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt),
  );
  const active = sorted.find((r) => r.status !== 'delivered' && r.status !== 'denied');
  const history = sorted.filter((r) => r !== active);

  const refillProductId = params.product ?? protocol.data?.items[0]?.productId;
  const protocolId = params.protocol || protocol.data?.id;
  const hasPendingForProduct = sorted.some(
    (r) => r.productId === refillProductId && r.status !== 'delivered' && r.status !== 'denied',
  );

  return (
    <Screen header={<Header showBack subtitle="Reorder your peptides" title="Refills" />}>
      {/* Active refill tracker */}
      {active && (
        <View>
          <SectionHeader title="Current request" />
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <IconCircle bg={color.primarySoft}>
                <Package size={20} color={color.primary} />
              </IconCircle>
              <View style={{ flex: 1 }}>
                <Text variant="title">{productName(active.productId)}</Text>
                <Text variant="bodySm" tone="muted">
                  Requested {relativeTime(active.requestedAt)}
                </Text>
              </View>
              <Badge
                label={titleCase(active.status)}
                tone={active.status === 'shipped' ? 'info' : 'brand'}
              />
            </View>
            <StatusTracker status={active.status} />
            {active.trackingNumber && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: color.infoSoft,
                  borderRadius: radius.lg,
                }}
              >
                <Truck size={16} color={color.info} />
                <Text variant="bodySm" tone="secondary">
                  Tracking: {active.trackingNumber}
                </Text>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Eligibility + request */}
      {active ? (
        <EligibilityCard refill={active} />
      ) : (
        <View>
          <SectionHeader title="Request a refill" />
          <Card>
            <Text variant="title">{productName(refillProductId ?? '')}</Text>
            <Text variant="bodySm" tone="muted" style={{ marginTop: 2 }}>
              Your provider will review the request and confirm your next vial.
            </Text>
            <View style={{ marginTop: 14 }}>
              <Button
                label={hasPendingForProduct ? 'Request already in progress' : 'Request refill'}
                fullWidth
                disabled={hasPendingForProduct || !refillProductId}
                loading={requestRefill.isPending}
                icon={<RefreshCw size={17} color={color.onPrimary} />}
                onPress={() =>
                  refillProductId &&
                  protocolId &&
                  requestRefill.mutate({ productId: refillProductId, protocolId })
                }
              />
            </View>
          </Card>
        </View>
      )}

      {/* History */}
      {history.length > 0 && (
        <View>
          <SectionHeader title="Refill history" />
          <Card padded={false}>
            {history.map((r, idx) => (
              <View key={r.id}>
                {idx > 0 && <View style={{ height: 1, backgroundColor: color.border, marginLeft: 62 }} />}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
                  <IconCircle bg={r.status === 'denied' ? color.dangerSoft : color.successSoft}>
                    {r.status === 'denied' ? (
                      <CircleX size={18} color={color.danger} />
                    ) : (
                      <CircleCheck size={18} color={color.success} />
                    )}
                  </IconCircle>
                  <View style={{ flex: 1 }}>
                    <Text variant="title">{productName(r.productId)}</Text>
                    <Text variant="bodySm" tone="muted">
                      {formatDate(r.requestedAt)} · {STATUS_LABEL[r.status]}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}
    </Screen>
  );
}

function StatusTracker({ status }: { status: RefillStatus }) {
  if (status === 'denied') {
    return (
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 6 }}>
        <CircleX size={18} color={color.danger} />
        <Text variant="bodySm" tone="danger">
          This request was not approved. Message your clinic for details.
        </Text>
      </View>
    );
  }
  const currentIndex = FLOW.indexOf(status);
  return (
    <View style={{ marginTop: 8 }}>
      {FLOW.map((s, idx) => {
        const done = idx < currentIndex;
        const current = idx === currentIndex;
        return (
          <View key={s} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: done || current ? color.primary : color.surfaceSunken,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: current ? 3 : 0,
                  borderColor: color.primarySoft,
                }}
              >
                {done && <Check size={13} color={color.onPrimary} strokeWidth={3} />}
              </View>
              {idx < FLOW.length - 1 && (
                <View style={{ width: 2, flex: 1, backgroundColor: done ? color.primary : color.border }} />
              )}
            </View>
            <Text
              variant="bodySm"
              tone={current ? 'brand' : done ? 'secondary' : 'muted'}
              style={{ paddingBottom: idx < FLOW.length - 1 ? 14 : 0, flex: 1 }}
            >
              {STATUS_LABEL[s]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function EligibilityCard({ refill }: { refill: RefillRequest }) {
  return (
    <View>
      <SectionHeader title="Eligibility" />
      <Card>
        {refill.eligibility.map((e, idx) => (
          <View
            key={e.rule}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 11,
              borderTopWidth: idx > 0 ? 1 : 0,
              borderTopColor: color.border,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: e.passed ? color.successSoft : color.warningSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {e.passed ? (
                <Check size={13} color={color.success} strokeWidth={3} />
              ) : (
                <Text variant="caption" tone="warning">
                  !
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodySm">{e.label}</Text>
              <Text variant="caption" tone="muted">
                {e.detail}
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}
