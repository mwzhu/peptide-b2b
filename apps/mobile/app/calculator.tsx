import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  computeReconstitution,
  validateReconstitution,
  type RoundingPolicy,
} from '@beacon/calculations';
import type { SyringeType } from '@beacon/domain';
import { CircleAlert, Info, Minus, Plus, ShieldCheck, TriangleAlert } from 'lucide-react-native';
import { color, radius } from '../src/theme';
import {
  Badge,
  Card,
  Header,
  SectionHeader,
  SegmentedControl,
  Screen,
  Text,
} from '../src/components/ui';
import { SyringeViz } from '../src/components/SyringeViz';
import { useProtocol, useProducts } from '../src/lib/hooks';

export default function Calculator() {
  const protocol = useProtocol();
  const products = useProducts();

  const item = protocol.data?.items[0];
  const product = products.data?.find((p) => p.id === item?.productId);

  const [vialMg, setVialMg] = useState(0);
  const [diluentMl, setDiluentMl] = useState(0);
  const [doseMcg, setDoseMcg] = useState(0);
  const [syringe, setSyringe] = useState<SyringeType>('u100');
  const [initialized, setInitialized] = useState(false);
  const policy: RoundingPolicy = 'nearest_whole_unit';

  // Seed inputs from the provider's protocol once data arrives.
  if (!initialized && item && product) {
    setVialMg(product.vialAmount.unit === 'mg' ? product.vialAmount.value : product.vialAmount.value / 1000);
    setDiluentMl(item.reconstitution.diluentMl);
    setDoseMcg(item.dose.unit === 'mg' ? item.dose.value * 1000 : item.dose.value);
    setSyringe(item.reconstitution.syringeType);
    setInitialized(true);
  }

  const result = useMemo(() => {
    if (!initialized || vialMg <= 0 || diluentMl <= 0 || doseMcg <= 0) return undefined;
    try {
      return computeReconstitution({
        vialAmount: { value: vialMg, unit: 'mg' },
        diluentMl,
        prescribedDose: { value: doseMcg, unit: 'mcg' },
        syringeType: syringe,
        roundingPolicy: policy,
      });
    } catch {
      return undefined;
    }
  }, [initialized, vialMg, diluentMl, doseMcg, syringe, policy]);

  const issues = useMemo(() => {
    if (!initialized || vialMg <= 0 || diluentMl <= 0 || doseMcg <= 0) return [];
    return validateReconstitution({
      vialAmount: { value: vialMg, unit: 'mg' },
      diluentMl,
      prescribedDose: { value: doseMcg, unit: 'mcg' },
      syringeType: syringe,
      roundingPolicy: policy,
    });
  }, [initialized, vialMg, diluentMl, doseMcg, syringe, policy]);

  const hasError = issues.some((i) => i.level === 'error');

  return (
    <Screen header={<Header showBack subtitle="Dosing tool" title="Reconstitution" />}>
      {/* Intro */}
      <Card variant="tinted">
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Info size={18} color={color.primary} style={{ marginTop: 1 }} />
          <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
            Enter your vial and dose details — Beacon shows exactly how far to draw the
            plunger on your syringe.
            {product ? ` Pre-filled for ${product.name}.` : ''}
          </Text>
        </View>
      </Card>

      {/* Result hero */}
      <Card>
        <SyringeViz units={result?.displayUnits ?? 0} maxUnits={syringe === 'u100' ? 100 : 50} />
        {result && !hasError ? (
          <View style={{ alignItems: 'center', marginTop: 6, gap: 4 }}>
            <Text variant="overline" tone="muted">
              DRAW TO
            </Text>
            <Text variant="display" tone="brand">
              {result.displayUnits}
              <Text variant="h2" tone="muted">
                {' '}
                units
              </Text>
            </Text>
            <Text variant="bodySm" tone="muted" center>
              {result.roundingDisclosure}
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <Text variant="title" tone="muted">
              Adjust the values below
            </Text>
          </View>
        )}
      </Card>

      {/* Issues */}
      {issues.map((issue) => (
        <Card
          key={issue.code}
          variant="flat"
          style={{
            borderColor: issue.level === 'error' ? color.danger : color.warning,
            backgroundColor: issue.level === 'error' ? color.dangerSoft : color.warningSoft,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {issue.level === 'error' ? (
              <CircleAlert size={18} color={color.danger} />
            ) : (
              <TriangleAlert size={18} color={color.warning} />
            )}
            <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
              {issue.message}
            </Text>
          </View>
        </Card>
      ))}

      {/* Inputs */}
      <View>
        <SectionHeader title="Vial & dose" />
        <Card>
          <Stepper label="Vial peptide amount" value={vialMg} unit="mg" step={1} min={1} onChange={setVialMg} />
          <Divider />
          <Stepper
            label="Bacteriostatic water"
            value={diluentMl}
            unit="mL"
            step={0.5}
            min={0.5}
            decimals={1}
            onChange={setDiluentMl}
          />
          <Divider />
          <Stepper label="Prescribed dose" value={doseMcg} unit="mcg" step={50} min={50} onChange={setDoseMcg} />
        </Card>
      </View>

      {/* Syringe */}
      <View>
        <SectionHeader title="Syringe" />
        <SegmentedControl
          value={syringe}
          onChange={setSyringe}
          options={[
            { value: 'u100', label: 'U-100' },
            { value: 'u50', label: 'U-50' },
            { value: 'u40', label: 'U-40' },
          ]}
        />
      </View>

      {/* Computed details */}
      {result && !hasError && (
        <View>
          <SectionHeader title="Details" />
          <Card>
            <DetailRow label="Concentration" value={`${result.concentrationMcgPerMl.toLocaleString()} mcg/mL`} />
            <Divider />
            <DetailRow label="Draw volume" value={`${result.drawVolumeMl} mL`} />
            <Divider />
            <DetailRow label="Exact syringe units" value={`${result.syringeUnits}`} />
            <Divider />
            <DetailRow
              label="Doses per vial"
              value={`${result.estimatedDosesPerVial}`}
              highlight
            />
          </Card>
        </View>
      )}

      {/* Provider note */}
      <Card variant="tinted">
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <ShieldCheck size={18} color={color.success} />
          <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
            Your clinic set the recommended values. Always confirm your dose with your
            provider before injecting.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

function Stepper({
  label,
  value,
  unit,
  step,
  min,
  decimals = 0,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  decimals?: number;
  onChange: (v: number) => void;
}) {
  const set = (delta: number) => {
    const next = Math.max(min, Math.round((value + delta) * 100) / 100);
    onChange(next);
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
      <View style={{ flex: 1 }}>
        <Text variant="bodySm" tone="secondary">
          {label}
        </Text>
        <Text variant="h3">
          {value.toFixed(decimals)}{' '}
          <Text variant="bodySm" tone="muted">
            {unit}
          </Text>
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <StepBtn variant="minus" onPress={() => set(-step)}>
          <Minus size={18} color={color.textPrimary} />
        </StepBtn>
        <StepBtn variant="plus" onPress={() => set(step)}>
          <Plus size={18} color={color.onPrimary} />
        </StepBtn>
      </View>
    </View>
  );
}

function StepBtn({
  children,
  onPress,
  variant,
}: {
  children: React.ReactNode;
  onPress: () => void;
  variant: 'plus' | 'minus';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: variant === 'plus' ? color.primary : color.surfaceSunken,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      {children}
    </Pressable>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: color.border }} />;
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View
      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 }}
    >
      <Text variant="body" tone="secondary">
        {label}
      </Text>
      {highlight ? (
        <Badge label={value} tone="brand" />
      ) : (
        <Text variant="title">{value}</Text>
      )}
    </View>
  );
}
