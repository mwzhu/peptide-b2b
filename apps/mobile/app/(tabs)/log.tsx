import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ClipboardCheck, Syringe, TriangleAlert } from 'lucide-react-native';
import type { DoseOccurrence, DoseStatus } from '@beacon/domain';
import { color, radius } from '../../src/theme';
import {
  Badge,
  Card,
  EmptyState,
  IconCircle,
  SectionHeader,
  SegmentedControl,
  Screen,
  Text,
} from '../../src/components/ui';
import { dayOffsetLabel, formatDose, formatSite, formatTime } from '../../src/lib/format';
import { useDoseLogs, useOccurrences, useProducts } from '../../src/lib/hooks';

const STATUS_TONE: Record<DoseStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'brand'> = {
  taken: 'success',
  upcoming: 'neutral',
  due: 'brand',
  late: 'warning',
  missed: 'danger',
  skipped: 'neutral',
};

export default function LogScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const occurrences = useOccurrences();
  const products = useProducts();
  const doseLogs = useDoseLogs();

  if (!occurrences.data || !products.data) {
    return (
      <Screen tabBar>
        <View style={{ paddingTop: 120, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const productName = (id: string) => products.data.find((p) => p.id === id)?.name ?? 'Peptide';
  const siteFor = (occId: string) =>
    doseLogs.data?.find((l) => l.occurrenceId === occId)?.site;

  const all = [...occurrences.data].sort(
    (a, b) => +new Date(b.scheduledFor) - +new Date(a.scheduledFor),
  );
  const history = all.filter((o) => o.status === 'taken' || o.status === 'missed' || o.status === 'skipped' || o.status === 'late');
  const upcoming = all
    .filter((o) => o.status === 'upcoming' || o.status === 'due')
    .reverse();
  const rows = tab === 'upcoming' ? upcoming : history;

  // Group by day label.
  const groups = rows.reduce<Record<string, DoseOccurrence[]>>((acc, o) => {
    const key = dayOffsetLabel(o.scheduledFor);
    (acc[key] ??= []).push(o);
    return acc;
  }, {});

  return (
    <Screen tabBar header={<Text variant="h1">Activity</Text>}>
      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <ActionTile
          icon={<Syringe size={20} color={color.primary} />}
          label="Log dose"
          onPress={() => router.push('/log-dose')}
        />
        <ActionTile
          icon={<TriangleAlert size={20} color={color.accent} />}
          label="Report symptom"
          tint={color.accentSoft}
          onPress={() => router.push('/report-symptom')}
        />
        <ActionTile
          icon={<ClipboardCheck size={20} color={color.info} />}
          label="Check-in"
          tint={color.infoSoft}
          onPress={() => router.push('/check-in')}
        />
      </View>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'history', label: 'History' },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<Syringe size={26} color={color.textMuted} />}
          title="Nothing here yet"
          message={tab === 'upcoming' ? 'No upcoming doses scheduled.' : 'Your dose history will appear here.'}
        />
      ) : (
        Object.entries(groups).map(([day, items]) => (
          <View key={day}>
            <SectionHeader title={day} />
            <Card padded={false}>
              {items.map((o, idx) => {
                const site = siteFor(o.id);
                return (
                  <View key={o.id}>
                    {idx > 0 && (
                      <View style={{ height: 1, backgroundColor: color.border, marginLeft: 62 }} />
                    )}
                    <Pressable
                      onPress={() =>
                        (o.status === 'due' || o.status === 'upcoming' || o.status === 'late') &&
                        router.push(`/log-dose?occ=${o.id}`)
                      }
                      style={({ pressed }) => [
                        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
                        pressed && { opacity: 0.6 },
                      ]}
                    >
                      <IconCircle
                        size={42}
                        bg={o.status === 'taken' ? color.successSoft : color.surfaceSunken}
                      >
                        <Syringe
                          size={18}
                          color={o.status === 'taken' ? color.success : color.textMuted}
                        />
                      </IconCircle>
                      <View style={{ flex: 1 }}>
                        <Text variant="title">{productName(o.productId)}</Text>
                        <Text variant="bodySm" tone="muted">
                          {formatDose(o.dose)} · {formatTime(o.scheduledFor)}
                          {site ? ` · ${formatSite(site)}` : ''}
                        </Text>
                      </View>
                      <Badge label={o.status} tone={STATUS_TONE[o.status]} />
                    </Pressable>
                  </View>
                );
              })}
            </Card>
          </View>
        ))
      )}
    </Screen>
  );
}

function ActionTile({
  icon,
  label,
  onPress,
  tint = color.primarySoft,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  tint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          backgroundColor: color.surface,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: color.border,
          paddingVertical: 16,
          alignItems: 'center',
          gap: 8,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </Pressable>
  );
}
