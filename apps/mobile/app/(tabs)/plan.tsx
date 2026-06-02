import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Activity,
  ChevronRight,
  ClipboardList,
  Clock,
  FlaskConical,
  Repeat,
  Syringe,
} from 'lucide-react-native';
import type { PeptideProduct, ProtocolItem } from '@beacon/domain';
import { color, radius } from '../../src/theme';
import {
  Badge,
  Card,
  IconCircle,
  ProgressBar,
  SectionHeader,
  Screen,
  Text,
} from '../../src/components/ui';
import { formatDate, formatDose, titleCase } from '../../src/lib/format';
import { useOccurrences, useProtocol, useProducts } from '../../src/lib/hooks';

const FREQUENCY_LABEL: Record<string, string> = {
  daily: 'Once daily',
  twice_weekly: 'Twice weekly',
  weekly: 'Once weekly',
  every_other_day: 'Every other day',
  five_on_two_off: '5 days on, 2 off',
};

export default function PlanScreen() {
  const router = useRouter();
  const protocol = useProtocol();
  const products = useProducts();
  const occurrences = useOccurrences();

  if (!protocol.data || !products.data) {
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

      {/* Monitoring */}
      <View>
        <SectionHeader title="Monitoring" />
        <Card>
          <View style={{ gap: 12 }}>
            {p.monitoring.map((m) => (
              <View key={m} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <IconCircle size={34} bg={color.primarySoft}>
                  <Activity size={16} color={color.primary} />
                </IconCircle>
                <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
                  {m}
                </Text>
              </View>
            ))}
          </View>
        </Card>
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
