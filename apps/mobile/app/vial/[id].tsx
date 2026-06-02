import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { daysUntil } from '@beacon/calculations';
import { CalendarClock, Droplet, FlaskConical, RefreshCw, ShieldCheck } from 'lucide-react-native';
import { color } from '../../src/theme';
import {
  Badge,
  Button,
  Card,
  Header,
  IconCircle,
  ProgressRing,
  SectionHeader,
  Screen,
  Text,
} from '../../src/components/ui';
import { SyringeViz } from '../../src/components/SyringeViz';
import { formatDate, titleCase } from '../../src/lib/format';
import { useProtocol, useProducts, useVials } from '../../src/lib/hooks';

export default function VialDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const vials = useVials();
  const products = useProducts();
  const protocol = useProtocol();

  if (!vials.data || !products.data) {
    return (
      <Screen header={<Header showBack title="Vial" />}>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const vial = vials.data.find((v) => v.id === params.id) ?? vials.data[0];
  if (!vial) {
    return (
      <Screen header={<Header showBack title="Vial" />}>
        <Text tone="muted">Vial not found.</Text>
      </Screen>
    );
  }
  const product = products.data.find((p) => p.id === vial.productId);
  const dosesLeft = Math.max(0, vial.estimatedTotalDoses - vial.dosesDrawn);
  const supplyRatio = dosesLeft / vial.estimatedTotalDoses;
  const budDays = vial.budDate ? daysUntil(vial.budDate) : undefined;
  const budTone = budDays === undefined ? 'neutral' : budDays <= 3 ? 'danger' : budDays <= 7 ? 'warning' : 'success';
  const snapshot = vial.snapshot;

  return (
    <Screen
      header={<Header showBack subtitle="Active vial" title={product?.name ?? 'Vial'} />}
      footer={
        <Button
          label="Request a refill"
          fullWidth
          onPress={() =>
            router.push(`/refills?product=${vial.productId}&protocol=${protocol.data?.id ?? ''}`)
          }
          icon={<RefreshCw size={17} color={color.onPrimary} />}
        />
      }
    >
      {/* State */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <IconCircle bg={color.infoSoft} size={52}>
            <Droplet size={24} color={color.info} />
          </IconCircle>
          <View style={{ flex: 1 }}>
            <Text variant="h3">{product?.name}</Text>
            <Text variant="bodySm" tone="muted">
              {product ? `${product.vialAmount.value} ${product.vialAmount.unit} vial` : ''} ·{' '}
              {titleCase(vial.state)}
            </Text>
          </View>
          <Badge label={titleCase(vial.state)} tone={vial.state === 'active' ? 'success' : 'neutral'} dot />
        </View>
      </Card>

      {/* Supply + BUD */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <ProgressRing value={supplyRatio} size={78} tone={color.info}>
              <Text variant="h3">{dosesLeft}</Text>
            </ProgressRing>
            <Text variant="overline" tone="muted">
              DOSES LEFT
            </Text>
            <Text variant="caption" tone="muted">
              {vial.dosesDrawn} of {vial.estimatedTotalDoses} used
            </Text>
          </View>
        </Card>
        <Card style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <IconCircle size={78} bg={budTone === 'danger' ? color.dangerSoft : budTone === 'warning' ? color.warningSoft : color.successSoft}>
              <Text
                variant="h1"
                textColor={budTone === 'danger' ? color.danger : budTone === 'warning' ? color.warning : color.success}
              >
                {budDays ?? '—'}
              </Text>
            </IconCircle>
            <Text variant="overline" tone="muted">
              DAYS TO DISCARD
            </Text>
            <Text variant="caption" tone="muted">
              {vial.budDate ? `Use by ${formatDate(vial.budDate)}` : 'Not reconstituted'}
            </Text>
          </View>
        </Card>
      </View>

      {budDays !== undefined && budDays <= 7 && (
        <Card variant="flat" style={{ borderColor: color.warning, backgroundColor: color.warningSoft }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CalendarClock size={18} color={color.warning} />
            <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
              This vial reaches its beyond-use date soon. Discard it after {vial.budDate ? formatDate(vial.budDate) : 'the listed date'} even if solution remains.
            </Text>
          </View>
        </Card>
      )}

      {/* Reconstitution snapshot */}
      {snapshot && (
        <View>
          <SectionHeader title="Reconstitution guidance" />
          <Card>
            <SyringeViz units={snapshot.displayUnits} maxUnits={snapshot.syringeType === 'u100' ? 100 : 50} />
            <View style={{ alignItems: 'center', marginVertical: 6, gap: 2 }}>
              <Text variant="h2" tone="brand">
                Draw to {snapshot.displayUnits} units
              </Text>
              <Text variant="caption" tone="muted" center>
                {snapshot.roundingDisclosure}
              </Text>
            </View>
            <View
              style={{
                marginTop: 10,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: color.border,
                gap: 10,
              }}
            >
              <SnapRow label="Concentration" value={`${snapshot.concentrationMcgPerMl.toLocaleString()} mcg/mL`} />
              <SnapRow label="Diluent volume" value={`${snapshot.diluentMl} mL`} />
              <SnapRow label="Draw volume" value={`${snapshot.drawVolumeMl} mL`} />
              <SnapRow label="Reconstituted" value={vial.reconstitutedAt ? formatDate(vial.reconstitutedAt) : '—'} />
            </View>
          </Card>
        </View>
      )}

      {/* Authoritative note */}
      <Card variant="tinted">
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <ShieldCheck size={18} color={color.success} />
          <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
            This guidance was generated and approved by your clinic. To explore different
            values, open the calculator.
          </Text>
        </View>
      </Card>

      <Button
        label="Open calculator"
        variant="secondary"
        fullWidth
        onPress={() => router.push('/calculator')}
        icon={<FlaskConical size={16} color={color.textPrimary} />}
      />
    </Screen>
  );
}

function SnapRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant="bodySm" tone="secondary">
        {label}
      </Text>
      <Text variant="bodySm" style={{ fontWeight: '600' }}>
        {value}
      </Text>
    </View>
  );
}
