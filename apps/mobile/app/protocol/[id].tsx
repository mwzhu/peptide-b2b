import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowUpRight,
  CalendarClock,
  Check,
  CircleDot,
  FlaskConical,
  Info,
  Repeat,
  Snowflake,
} from 'lucide-react-native';
import { color, radius } from '../../src/theme';
import {
  Badge,
  Button,
  Card,
  Chip,
  IconCircle,
  SectionHeader,
  Screen,
  Header,
  Text,
} from '../../src/components/ui';
import { formatDose, titleCase } from '../../src/lib/format';
import { useEducation, useProtocol, useProducts, useStaff } from '../../src/lib/hooks';

export default function ProtocolDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; item?: string }>();
  const protocol = useProtocol();
  const products = useProducts();
  const staff = useStaff();
  const education = useEducation();

  if (!protocol.data || !products.data) {
    return (
      <Screen header={<Header showBack title="Protocol" />}>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const p = protocol.data;
  const item = p.items.find((i) => i.id === params.item) ?? p.items[0]!;
  const product = products.data.find((x) => x.id === item.productId)!;
  const provider = staff.data?.find((s) => s.id === p.approvedByProviderId);
  const currentStepIndex = item.titration.reduce(
    (acc, step, idx) => (p.currentWeek >= step.startWeek ? idx : acc),
    0,
  );
  const relatedEdu = (education.data ?? []).filter(
    (e) => e.category === 'protocol' || e.category === 'injection' || e.category === 'reconstitution',
  );

  return (
    <Screen header={<Header showBack subtitle={p.name} title={product.name} />}>
      {/* Overview */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <IconCircle bg={color.primarySoft} size={52}>
            <FlaskConical size={24} color={color.primary} />
          </IconCircle>
          <View style={{ flex: 1 }}>
            <Text variant="h3">{formatDose(item.dose)}</Text>
            <Text variant="bodySm" tone="muted">
              {titleCase(item.route)} · {item.timeOfDay}
            </Text>
          </View>
          <Badge label={titleCase(product.category.replace('_', ' '))} tone="brand" />
        </View>
        <Text variant="body" tone="secondary" style={{ marginTop: 14 }}>
          {product.blurb}
        </Text>
      </Card>

      {/* Instructions */}
      <View>
        <SectionHeader title="How to take it" />
        <Card>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Info size={18} color={color.primary} style={{ marginTop: 2 }} />
            <Text variant="body" tone="secondary" style={{ flex: 1 }}>
              {item.instructions}
            </Text>
          </View>
        </Card>
      </View>

      {/* Titration ladder */}
      {item.titration.length > 1 && (
        <View>
          <SectionHeader title="Dose schedule" />
          <Card>
            {item.titration.map((step, idx) => {
              const done = idx < currentStepIndex;
              const current = idx === currentStepIndex;
              return (
                <View key={step.label} style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: done
                          ? color.primary
                          : current
                            ? color.primarySoft
                            : color.surfaceSunken,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: current ? 2 : 0,
                        borderColor: color.primary,
                      }}
                    >
                      {done ? (
                        <Check size={15} color={color.onPrimary} strokeWidth={3} />
                      ) : (
                        <CircleDot size={14} color={current ? color.primary : color.textMuted} />
                      )}
                    </View>
                    {idx < item.titration.length - 1 && (
                      <View style={{ width: 2, flex: 1, backgroundColor: done ? color.primary : color.border, marginVertical: 2 }} />
                    )}
                  </View>
                  <View style={{ flex: 1, paddingBottom: idx < item.titration.length - 1 ? 18 : 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text variant="title" tone={current ? 'brand' : 'primary'}>
                        {formatDose(step.dose)}
                      </Text>
                      {current && <Badge label="Current" tone="brand" />}
                    </View>
                    <Text variant="bodySm" tone="muted">
                      {step.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        </View>
      )}

      {/* Cycle */}
      {item.cycle.enabled && (
        <Card variant="tinted">
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <IconCircle bg={color.surface}>
              <Repeat size={20} color={color.accent} />
            </IconCircle>
            <View style={{ flex: 1 }}>
              <Text variant="title">Cycled dosing</Text>
              <Text variant="bodySm" tone="muted">
                {item.cycle.description}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Reconstitution */}
      <View>
        <SectionHeader title="Reconstitution" />
        <Card>
          <View style={{ flexDirection: 'row', gap: 18 }}>
            <ReconStat label="Diluent" value={`${item.reconstitution.diluentMl} mL`} />
            <ReconStat label="Syringe" value={item.reconstitution.syringeType.toUpperCase()} />
            <ReconStat label="Vial" value={formatDose(product.vialAmount)} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, alignItems: 'center' }}>
            <Snowflake size={15} color={color.info} />
            <Text variant="caption" tone="muted" style={{ flex: 1 }}>
              {product.storage}
            </Text>
          </View>
          <View style={{ marginTop: 14 }}>
            <Button
              label="Open reconstitution calculator"
              variant="secondary"
              fullWidth
              onPress={() => router.push('/calculator')}
              iconRight={<ArrowUpRight size={16} color={color.textPrimary} />}
            />
          </View>
        </Card>
      </View>

      {/* What to expect */}
      <View>
        <SectionHeader title="What to expect" />
        <Card>
          <View style={{ gap: 12 }}>
            {product.whatToExpect.map((w, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: color.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant="caption" tone="brand">
                    {i + 1}
                  </Text>
                </View>
                <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
                  {w}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Side effects */}
      <View>
        <SectionHeader title="Common side effects" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {product.commonSideEffects.map((s) => (
            <View
              key={s}
              style={{
                backgroundColor: color.surface,
                borderWidth: 1,
                borderColor: color.border,
                borderRadius: radius.full,
                paddingHorizontal: 12,
                paddingVertical: 7,
              }}
            >
              <Text variant="bodySm" tone="secondary">
                {s}
              </Text>
            </View>
          ))}
        </View>
        <Card variant="tinted" style={{ marginTop: 10 }}>
          <Text variant="bodySm" tone="secondary">
            Mild side effects are common early on. If anything feels severe or persistent,
            report it from the Log tab — your care team is notified right away.
          </Text>
        </Card>
      </View>

      {/* Provider */}
      {provider && (
        <Card>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <CalendarClock size={18} color={color.textMuted} />
            <Text variant="bodySm" tone="muted" style={{ flex: 1 }}>
              Approved by {provider.name}, {provider.credential}
            </Text>
          </View>
        </Card>
      )}

      {/* Education */}
      {relatedEdu.length > 0 && (
        <View>
          <SectionHeader title="Learn more" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {relatedEdu.map((e) => (
              <Chip key={e.id} label={e.title} onPress={() => router.push(`/education/${e.id}`)} />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

function ReconStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="overline" tone="muted">
        {label.toUpperCase()}
      </Text>
      <Text variant="title">{value}</Text>
    </View>
  );
}
