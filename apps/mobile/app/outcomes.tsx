import { ActivityIndicator, useWindowDimensions, View } from 'react-native';
import { Camera, TrendingDown } from 'lucide-react-native';
import type { OutcomeSeries } from '@beacon/domain';
import { color, palette, radius } from '../src/theme';
import {
  Badge,
  Button,
  Card,
  Header,
  SectionHeader,
  Screen,
  Text,
} from '../src/components/ui';
import { LineChart } from '../src/components/Chart';
import { formatDate, formatWeight } from '../src/lib/format';
import { useMe, useOutcomes, usePhotos } from '../src/lib/hooks';

export default function Outcomes() {
  const { width } = useWindowDimensions();
  const me = useMe();
  const outcomes = useOutcomes();
  const photos = usePhotos();

  if (!me.data || !outcomes.data) {
    return (
      <Screen header={<Header showBack title="Progress" />}>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const chartWidth = width - 40 - 36;
  const p = me.data;
  const lost = p.startWeightKg - p.currentWeightKg;
  const goalSpan = p.goalWeightKg ? p.startWeightKg - p.goalWeightKg : lost;
  const goalProgress = goalSpan > 0 ? Math.min(1, lost / goalSpan) : 0;

  return (
    <Screen header={<Header showBack subtitle="How you're doing" title="Progress" />}>
      {/* Goal progress */}
      {p.goalWeightKg && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={18} color={color.success} />
            <Text variant="title" style={{ flex: 1 }}>
              Weight goal
            </Text>
            <Badge label={`${formatWeight(lost)} so far`} tone="success" />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <Milestone label="Start" value={formatWeight(p.startWeightKg)} />
            <Milestone label="Now" value={formatWeight(p.currentWeightKg)} highlight />
            <Milestone label="Goal" value={formatWeight(p.goalWeightKg)} align="right" />
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

      {/* Metric charts — only surface clinically chartable metrics. */}
      <SectionHeader title="Trends" />
      {outcomes.data
        .filter((s) => s.kind !== 'energy' && s.kind !== 'sleep')
        .map((series) => (
          <MetricCard key={series.kind} series={series} width={chartWidth} />
        ))}

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
    </Screen>
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
    <View style={{ alignItems: align === 'right' ? 'flex-end' : align === 'left' ? 'flex-start' : 'center' }}>
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
