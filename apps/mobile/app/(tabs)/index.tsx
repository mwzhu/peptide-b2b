import { ActivityIndicator, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { daysUntil } from '@beacon/calculations';
import {
  Bell,
  CalendarDays,
  Check,
  ClipboardCheck,
  Droplet,
  MessageCircle,
  Sparkles,
  Syringe,
} from 'lucide-react-native';
import { color, nativeShadow, palette, radius } from '../../src/theme';
import {
  Badge,
  Card,
  IconCircle,
  ProgressBar,
  ProgressRing,
  SectionHeader,
  Screen,
  Text,
} from '../../src/components/ui';
import { formatDose, formatLongDate, formatTime, relativeTime } from '../../src/lib/format';
import {
  useAppointments,
  useNotifications,
  useOccurrences,
  useProtocol,
  useProducts,
  useVials,
} from '../../src/lib/hooks';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

export default function TodayScreen() {
  const router = useRouter();
  const protocol = useProtocol();
  const occurrences = useOccurrences();
  const vials = useVials();
  const products = useProducts();
  const notifications = useNotifications();
  const appointments = useAppointments();

  if (!protocol.data || !occurrences.data || !products.data) {
    return (
      <Screen tabBar>
        <View style={{ paddingTop: 120, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const productOf = (id: string) => products.data.find((p) => p.id === id);
  const sorted = [...occurrences.data].sort(
    (a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor),
  );
  const todays = sorted.filter((o) => isToday(o.scheduledFor) && o.status !== 'taken' && o.status !== 'skipped');
  const nextDose = todays[0] ?? sorted.find((o) => o.status === 'upcoming' || o.status === 'due');
  const nextProduct = nextDose ? productOf(nextDose.productId) : undefined;

  const last30 = sorted.filter((o) => {
    const days = daysUntil(o.scheduledFor);
    return days <= 0 && days >= -30 && o.status !== 'upcoming';
  });
  const taken = last30.filter((o) => o.status === 'taken').length;
  const adherence = last30.length ? taken / last30.length : 1;

  const vial = vials.data?.[0];
  const dosesLeft = vial ? Math.max(0, vial.estimatedTotalDoses - vial.dosesDrawn) : 0;
  const budDays = vial?.budDate ? daysUntil(vial.budDate) : undefined;
  const unread = notifications.data?.filter((n) => !n.read).length ?? 0;
  const nextAppt = appointments.data?.find((a) => a.status === 'scheduled');

  return (
    <Screen
      tabBar
      header={
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text variant="bodySm" tone="muted">
              {formatLongDate(new Date().toISOString())}
            </Text>
            <Text variant="h1">{greeting()}, Avery</Text>
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: color.surface,
              borderWidth: 1,
              borderColor: color.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={20} color={color.textPrimary} />
            {unread > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 9,
                  right: 9,
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: color.accent,
                  borderWidth: 1.5,
                  borderColor: color.surface,
                }}
              />
            )}
          </Pressable>
        </View>
      }
    >
      {/* Next dose hero */}
      {nextDose && nextProduct ? (
        <Pressable onPress={() => router.push(`/log-dose?occ=${nextDose.id}`)}>
          <LinearGradient
            colors={[palette.sage[400], palette.sage[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: radius['2xl'], padding: 22, ...nativeShadow.md }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ gap: 3 }}>
                <Text variant="overline" textColor="rgba(255,255,255,0.8)">
                  {isToday(nextDose.scheduledFor) ? 'TODAY’S DOSE' : 'NEXT DOSE'}
                </Text>
                <Text variant="h2" textColor={color.onPrimary}>
                  {nextProduct.name}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  borderRadius: radius.full,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text variant="caption" textColor={color.onPrimary}>
                  {isToday(nextDose.scheduledFor) ? formatTime(nextDose.scheduledFor) : relativeTime(nextDose.scheduledFor)}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 18 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Syringe size={26} color={color.onPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="h1" textColor={color.onPrimary}>
                  {formatDose(nextDose.dose)}
                </Text>
                <Text variant="bodySm" textColor="rgba(255,255,255,0.85)">
                  Subcutaneous · tap to log your dose
                </Text>
              </View>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: color.onPrimary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={22} color={palette.sage[600]} strokeWidth={3} />
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      ) : (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconCircle bg={color.successSoft}>
              <Check size={20} color={color.success} strokeWidth={3} />
            </IconCircle>
            <View style={{ flex: 1 }}>
              <Text variant="title">All caught up</Text>
              <Text variant="bodySm" tone="muted">
                No doses scheduled right now.
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Adherence + cycle */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <ProgressRing value={adherence} size={62}>
              <Text variant="title">{Math.round(adherence * 100)}</Text>
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <Text variant="overline" tone="muted">
                ADHERENCE
              </Text>
              <Text variant="title">Last 30 days</Text>
              <Text variant="caption" tone="muted">
                {taken} of {last30.length} doses
              </Text>
            </View>
          </View>
        </Card>
        <Card style={{ width: 132 }}>
          <Text variant="overline" tone="muted">
            PROGRAM
          </Text>
          <Text variant="h2" tone="brand">
            Week {protocol.data.currentWeek}
          </Text>
          <Text variant="caption" tone="muted">
            of {protocol.data.durationWeeks} · {protocol.data.name}
          </Text>
        </Card>
      </View>

      {/* Active vial */}
      {vial ? (
        <Card onPress={() => router.push(`/vial/${vial.id}`)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <IconCircle bg={color.infoSoft}>
              <Droplet size={20} color={color.info} />
            </IconCircle>
            <View style={{ flex: 1 }}>
              <Text variant="title">Active vial</Text>
              <Text variant="bodySm" tone="muted">
                {productOf(vial.productId)?.name}
              </Text>
            </View>
            {budDays !== undefined && budDays <= 7 && (
              <Badge label={`${budDays}d to discard`} tone="warning" />
            )}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text variant="bodySm" tone="secondary">
              {dosesLeft} doses remaining
            </Text>
            <Text variant="bodySm" tone="muted">
              {vial.dosesDrawn}/{vial.estimatedTotalDoses} used
            </Text>
          </View>
          <ProgressBar value={dosesLeft / vial.estimatedTotalDoses} tone={color.info} />
        </Card>
      ) : null}

      {/* Quick actions */}
      <View>
        <SectionHeader title="Quick actions" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <QuickAction icon={<Syringe size={20} color={color.primary} />} label="Log dose" onPress={() => router.push(nextDose ? `/log-dose?occ=${nextDose.id}` : '/log-dose')} />
          <QuickAction icon={<ClipboardCheck size={20} color={color.primary} />} label="Check-in" onPress={() => router.push('/check-in')} />
          <QuickAction icon={<Sparkles size={20} color={color.primary} />} label="Calculator" onPress={() => router.push('/calculator')} />
          <QuickAction icon={<MessageCircle size={20} color={color.primary} />} label="Message" onPress={() => router.push('/(tabs)/messages')} />
        </View>
      </View>

      {/* Next appointment */}
      {nextAppt ? (
        <View>
          <SectionHeader title="Upcoming" />
          <Card onPress={() => router.push('/appointments')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconCircle bg={color.accentSoft}>
                <CalendarDays size={20} color={color.accent} />
              </IconCircle>
              <View style={{ flex: 1 }}>
                <Text variant="title">Follow-up visit</Text>
                <Text variant="bodySm" tone="muted">
                  {formatLongDate(nextAppt.startsAt)} · {formatTime(nextAppt.startsAt)}
                </Text>
              </View>
              <Text variant="bodySm" tone="brand">
                {relativeTime(nextAppt.startsAt)}
              </Text>
            </View>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
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
          paddingVertical: 14,
          alignItems: 'center',
          gap: 7,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: color.primarySoft,
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
