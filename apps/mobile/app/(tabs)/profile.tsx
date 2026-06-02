import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  CreditCard,
  FileText,
  FlaskConical,
  HeartPulse,
  LifeBuoy,
  LineChart as LineChartIcon,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { color, radius } from '../../src/theme';
import { Avatar, Card, IconCircle, SectionHeader, Screen, Text } from '../../src/components/ui';
import { useClinic, useMe, useProtocol, useStaff } from '../../src/lib/hooks';

export default function ProfileScreen() {
  const router = useRouter();
  const me = useMe();
  const clinic = useClinic();
  const protocol = useProtocol();
  const staff = useStaff();

  if (!me.data || !clinic.data) {
    return (
      <Screen tabBar>
        <View style={{ paddingTop: 120, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const p = me.data;
  const team = (staff.data ?? []).filter((s) => p.careTeamIds.includes(s.id));
  const daysIn = Math.max(7, Math.round((Date.now() - +new Date(p.enrolledAt)) / 86400000));
  const weeksIn = daysIn / 7;
  const totalLossLb = (p.startWeightKg - p.currentWeightKg) * 2.20462;
  const lossPerWeek = totalLossLb / weeksIn;
  const lossStat =
    Math.abs(lossPerWeek) < 0.05
      ? '—'
      : `${lossPerWeek > 0 ? '−' : '+'}${Math.abs(lossPerWeek).toFixed(1)} lb`;

  return (
    <Screen tabBar header={<Text variant="h1">Profile</Text>}>
      {/* Identity */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={`${p.firstName} ${p.lastName}`} hue={p.avatarHue} size={62} />
          <View style={{ flex: 1 }}>
            <Text variant="h3">
              {p.firstName} {p.lastName}
            </Text>
            <Text variant="bodySm" tone="muted">
              {clinic.data.name} member
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: color.border,
          }}
        >
          <MiniStat label="Program" value={protocol.data ? `Wk ${protocol.data.currentWeek}` : '—'} />
          <MiniStat label="Adherence" value={`${Math.round(p.adherence30d * 100)}%`} />
          <MiniStat label="Loss / wk" value={lossStat} last />
        </View>
      </Card>

      {/* Care team */}
      <View>
        <SectionHeader title="Your care team" />
        <Card padded={false}>
          {team.map((s, idx) => (
            <View key={s.id}>
              {idx > 0 && <View style={{ height: 1, backgroundColor: color.border, marginLeft: 62 }} />}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <Avatar name={s.name} hue={s.avatarHue} size={40} />
                <View style={{ flex: 1 }}>
                  <Text variant="title">{s.name}</Text>
                  <Text variant="bodySm" tone="muted">
                    {s.title}
                  </Text>
                </View>
                <HeartPulse size={18} color={color.textMuted} />
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Settings */}
      <View>
        <SectionHeader title="Account" />
        <Card padded={false}>
          <Row icon={<LineChartIcon size={18} color={color.primary} />} label="Progress & photos" onPress={() => router.push('/outcomes')} />
          <Sep />
          <Row icon={<FileText size={18} color={color.primary} />} label="Labs & documents" onPress={() => router.push('/labs')} />
          <Sep />
          <Row icon={<FlaskConical size={18} color={color.primary} />} label="Reconstitution calculator" onPress={() => router.push('/calculator')} />
          <Sep />
          <Row icon={<BookOpen size={18} color={color.primary} />} label="Education library" onPress={() => router.push('/education')} />
          <Sep />
          <Row icon={<CreditCard size={18} color={color.primary} />} label="Billing & membership" />
        </Card>
      </View>

      <View>
        <SectionHeader title="Privacy & support" />
        <Card padded={false}>
          <Row icon={<ShieldCheck size={18} color={color.primary} />} label="Privacy & data" />
          <Sep />
          <Row icon={<LifeBuoy size={18} color={color.primary} />} label="Help center" />
          <Sep />
          <Row
            icon={<RefreshCw size={18} color={color.primary} />}
            label="Replay onboarding"
            onPress={() => router.push('/onboarding')}
          />
        </Card>
      </View>

      {/* Sign out */}
      <Pressable
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
          },
          pressed && { opacity: 0.6 },
        ]}
      >
        <LogOut size={17} color={color.danger} />
        <Text variant="title" tone="danger">
          Sign out
        </Text>
      </Pressable>

      <View style={{ alignItems: 'center', gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Sparkles size={13} color={color.textMuted} />
          <Text variant="caption" tone="muted">
            Beacon · version 0.1.0
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function MiniStat({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        borderRightWidth: last ? 0 : 1,
        borderRightColor: color.border,
      }}
    >
      <Text variant="h3" tone="brand">
        {value}
      </Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
        pressed && { opacity: 0.6 },
      ]}
    >
      <IconCircle size={36} bg={color.primarySoft}>
        {icon}
      </IconCircle>
      <Text variant="title" style={{ flex: 1 }}>
        {label}
      </Text>
      <ChevronRight size={18} color={color.textMuted} />
    </Pressable>
  );
}

function Sep() {
  return <View style={{ height: 1, backgroundColor: color.border, marginLeft: 62 }} />;
}
