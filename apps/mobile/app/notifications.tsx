import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, CalendarDays, CircleAlert, Droplet, MessageCircle, Syringe } from 'lucide-react-native';
import type { AppNotification } from '@beacon/domain';
import { color } from '../src/theme';
import { Card, EmptyState, IconCircle, Header, Screen, Text } from '../src/components/ui';
import { relativeTime } from '../src/lib/format';
import { useMarkNotificationRead, useNotifications } from '../src/lib/hooks';

const ICONS: Record<AppNotification['kind'], { Icon: typeof Bell; tint: string; fg: string }> = {
  dose: { Icon: Syringe, tint: color.primarySoft, fg: color.primary },
  bud: { Icon: Droplet, tint: color.warningSoft, fg: color.warning },
  refill: { Icon: CircleAlert, tint: color.infoSoft, fg: color.info },
  message: { Icon: MessageCircle, tint: color.primarySoft, fg: color.primary },
  appointment: { Icon: CalendarDays, tint: color.accentSoft, fg: color.accent },
  lab: { Icon: CircleAlert, tint: color.infoSoft, fg: color.info },
};

export default function Notifications() {
  const router = useRouter();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();

  const sorted = [...(notifications.data ?? [])].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );

  return (
    <Screen header={<Header showBack title="Notifications" />}>
      {!notifications.data ? (
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<Bell size={26} color={color.textMuted} />}
          title="You're all caught up"
          message="Reminders and updates from your clinic will appear here."
        />
      ) : (
        <Card padded={false}>
          {sorted.map((n, idx) => {
            const meta = ICONS[n.kind];
            return (
              <View key={n.id}>
                {idx > 0 && <View style={{ height: 1, backgroundColor: color.border, marginLeft: 62 }} />}
                <Pressable
                  onPress={() => {
                    if (!n.read) markRead.mutate(n.id);
                    if (n.kind === 'message') router.push('/(tabs)/messages');
                    if (n.kind === 'appointment') router.push('/appointments');
                    if (n.kind === 'dose') router.push('/(tabs)/log');
                  }}
                  style={({ pressed }) => [
                    { flexDirection: 'row', gap: 12, padding: 16 },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <IconCircle bg={meta.tint}>
                    <meta.Icon size={19} color={meta.fg} />
                  </IconCircle>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text variant="title" style={{ flex: 1 }}>
                        {n.title}
                      </Text>
                      {!n.read && (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.accent }} />
                      )}
                    </View>
                    <Text variant="bodySm" tone="muted">
                      {n.body}
                    </Text>
                    <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                      {relativeTime(n.createdAt)}
                    </Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}
