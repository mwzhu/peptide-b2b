import { ActivityIndicator, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Camera,
  ChevronRight,
  ClipboardList,
  Clock,
  FlaskConical,
  Repeat,
  Syringe,
  TrendingDown,
} from 'lucide-react-native';
import type { OutcomeSeries, PeptideProduct, ProtocolItem } from '@beacon/domain';
import { color, palette, radius } from '../../src/theme';
import {
  Badge,
  Button,
  Card,
  IconCircle,
  ProgressBar,
  SectionHeader,
  Screen,
  Text,
} from '../../src/components/ui';
import { LineChart } from '../../src/components/Chart';
import { formatDate, formatDose, formatWeight, titleCase } from '../../src/lib/format';
import { useMe, useOccurrences, useOutcomes, usePhotos, useProtocol, useProducts } from '../../src/lib/hooks';

const FREQUENCY_LABEL: Record<string, string> = {
  daily: 'Once daily',
  twice_weekly: 'Twice weekly',
  weekly: 'Once weekly',
  every_other_day: 'Every other day',
  five_on_two_off: '5 days on, 2 off',
};

export default function PlanScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const protocol = useProtocol();
  const products = useProducts();
  const occurrences = useOccurrences();
  const me = useMe();
  const outcomes = useOutcomes();
  const photos = usePhotos();

  if (!protocol.data || !products.data || !me.data || !outcomes.data) {
    return (
      <Screen tabBar>
        <View style={{ paddingTop: 120, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const p = protocol.data;
  const progress = p.currentWeek / p.durationWeeks;
  const productOf = (id: string) => products.data.find((x) => x.id === id);

  const chartWidth = width - 40 - 36;
  const patient = me.data;
  const lost = patient.startWeightKg - patient.currentWeightKg;
  const goalSpan = patient.goalWeightKg ? patient.startWeightKg - patient.goalWeightKg : lost;
  const goalProgress = goalSpan > 0 ? Math.min(1, lost / goalSpan) : 0;

  const nextFor = (itemId: string) => {
    const up = (occurrences.data ?? [])
      .filter((o) => o.protocolItemId === itemId && o.status !== 'taken' && o.status !== 'skipped')
      .sort((a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor))[0];
    return up ? formatDate(up.scheduledFor) : '—';
  };

  return (
    <Screen tabBar header={<Text variant="h1">My Plan</Text>}>
      {/* Protocol status */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text variant="overline" tone="muted">
              ACTIVE PROTOCOL
            </Text>
            <Text variant="h2">{p.name}</Text>
          </View>
          <Badge label={titleCase(p.status)} tone={p.status === 'active' ? 'success' : 'warning'} dot />
        </View>
        <View style={{ marginTop: 16, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="bodySm" tone="secondary">
              Week {p.currentWeek} of {p.durationWeeks}
            </Text>
            <Text variant="bodySm" tone="muted">
              {Math.round(progress * 100)}% complete
            </Text>
          </View>
          <ProgressBar value={progress} />
          <Text variant="caption" tone="muted">
            Started {formatDate(p.startDate)} · projected finish {formatDate(p.endDate)}
          </Text>
        </View>
      </Card>

      {/* Peptides */}
      <View>
        <SectionHeader title={p.items.length > 1 ? 'Your peptides' : 'Your peptide'} />
        <View style={{ gap: 12 }}>
          {p.items.map((item) => {
            const product = productOf(item.productId);
            if (!product) return null;
            return (
              <PeptideCard
                key={item.id}
                item={item}
                product={product}
                nextDose={nextFor(item.id)}
                onPress={() => router.push(`/protocol/${p.id}?item=${item.id}`)}
              />
            );
          })}
        </View>
      </View>

      {/* Goal progress */}
      {patient.goalWeightKg && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={18} color={color.success} />
            <Text variant="title" style={{ flex: 1 }}>
              Weight goal
            </Text>
            <Badge label={`${formatWeight(lost)} so far`} tone="success" />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <Milestone label="Start" value={formatWeight(patient.startWeightKg)} />
            <Milestone label="Now" value={formatWeight(patient.currentWeightKg)} highlight />
            <Milestone label="Goal" value={formatWeight(patient.goalWeightKg)} align="right" />
          </View>
          <View
            style={{
              height: 10,
              borderRadius: 5,
              backgroundColor: color.surfaceSunken,
              marginTop: 10,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${goalProgress * 100}%`,
                height: '100%',
                borderRadius: 5,
                backgroundColor: color.success,
              }}
            />
          </View>
          <Text variant="caption" tone="muted" style={{ marginTop: 6 }}>
            {Math.round(goalProgress * 100)}% of the way to your goal
          </Text>
        </Card>
      )}

      {/* Metric charts */}
      <View>
        <SectionHeader title="Trends" />
        <View style={{ gap: 12 }}>
          {outcomes.data
            .filter((s) => s.kind !== 'energy' && s.kind !== 'sleep')
            .map((series) => (
              <MetricCard key={series.kind} series={series} width={chartWidth} />
            ))}
        </View>
      </View>

      {/* Progress photos */}
      <View>
        <SectionHeader title="Progress photos" />
        {photos.data && photos.data.length >= 2 ? (
          <Card>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[photos.data[0]!, photos.data[photos.data.length - 1]!].map((photo, i) => (
                <View key={photo.id} style={{ flex: 1, gap: 6 }}>
                  <View
                    style={{
                      height: 168,
                      borderRadius: radius.lg,
                      backgroundColor: `hsl(${photo.hue}, 32%, ${i === 0 ? 84 : 74}%)`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Camera size={26} color={`hsl(${photo.hue}, 30%, 45%)`} />
                  </View>
                  <Text variant="caption" tone="muted" center>
                    {i === 0 ? 'Start' : 'Latest'} · {formatDate(photo.takenOn)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        ) : (
          <Card variant="tinted">
            <Text variant="bodySm" tone="secondary">
              Add a progress photo to start your before-and-after.
            </Text>
          </Card>
        )}
        <View style={{ marginTop: 10 }}>
          <Button label="Add a progress photo" variant="secondary" fullWidth icon={<Camera size={16} color={color.textPrimary} />} />
        </View>
      </View>

      {/* Links */}
      <View>
        <SectionHeader title="Resources" />
        <Card padded={false}>
          <LinkRow
            icon={<FlaskConical size={18} color={color.primary} />}
            label="Reconstitution calculator"
            onPress={() => router.push('/calculator')}
          />
          <View style={{ height: 1, backgroundColor: color.border, marginLeft: 52 }} />
          <LinkRow
            icon={<ClipboardList size={18} color={color.primary} />}
            label="Care plan & documents"
            onPress={() => router.push('/labs')}
          />
        </Card>
      </View>
    </Screen>
  );
}

function PeptideCard({
  item,
  product,
  nextDose,
  onPress,
}: {
  item: ProtocolItem;
  product: PeptideProduct;
  nextDose: string;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconCircle bg={color.primarySoft} size={48}>
          <Syringe size={22} color={color.primary} />
        </IconCircle>
        <View style={{ flex: 1 }}>
          <Text variant="title">{product.name}</Text>
          <Text variant="bodySm" tone="muted">
            {formatDose(item.dose)} · {titleCase(item.route)}
          </Text>
        </View>
        <ChevronRight size={20} color={color.textMuted} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          marginTop: 14,
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: color.border,
        }}
      >
        <MetaPill icon={<Repeat size={13} color={color.textMuted} />} text={FREQUENCY_LABEL[item.frequency] ?? item.frequency} />
        <MetaPill icon={<Clock size={13} color={color.textMuted} />} text={item.timeOfDay} />
        <MetaPill text={`Next ${nextDose}`} />
      </View>
    </Card>
  );
}

function MetaPill({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: color.surfaceSunken,
        borderRadius: radius.full,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      {icon}
      <Text variant="caption" tone="secondary">
        {text}
      </Text>
    </View>
  );
}

function Milestone({
  label,
  value,
  highlight,
  align = 'left',
}: {
  label: string;
  value: string;
  highlight?: boolean;
  align?: 'left' | 'right';
}) {
  return (
    <View style={{ alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}>
      <Text variant="overline" tone="muted">
        {label.toUpperCase()}
      </Text>
      <Text variant="h3" tone={highlight ? 'brand' : 'primary'}>
        {value}
      </Text>
    </View>
  );
}

function MetricCard({ series, width }: { series: OutcomeSeries; width: number }) {
  const first = series.points[0]?.value ?? 0;
  const last = series.points[series.points.length - 1]?.value ?? 0;
  const delta = Math.round((last - first) * 10) / 10;
  const improving = series.kind === 'weight' || series.kind === 'waist' ? delta < 0 : delta > 0;
  const tone =
    series.kind === 'weight' ? palette.sage[500] : series.kind === 'sleep' ? palette.blue[400] : palette.clay[400];

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Text variant="overline" tone="muted">
            {series.label.toUpperCase()}
          </Text>
          <Text variant="h2">
            {last}
            <Text variant="bodySm" tone="muted">
              {' '}
              {series.unit}
            </Text>
          </Text>
        </View>
        <Badge
          label={`${delta > 0 ? '+' : ''}${delta} ${series.unit}`}
          tone={improving ? 'success' : 'neutral'}
        />
      </View>
      <View style={{ marginTop: 8 }}>
        <LineChart points={series.points} width={width} tone={tone} />
      </View>
    </Card>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Card variant="flat" padded={false} onPress={onPress} style={{ borderWidth: 0, backgroundColor: 'transparent' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
        <IconCircle size={34} bg={color.primarySoft}>
          {icon}
        </IconCircle>
        <Text variant="title" style={{ flex: 1 }}>
          {label}
        </Text>
        <ChevronRight size={18} color={color.textMuted} />
      </View>
    </Card>
  );
}
