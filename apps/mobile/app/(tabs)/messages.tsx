import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PenLine } from 'lucide-react-native';
import { color, radius } from '../../src/theme';
import { Badge, Card, EmptyState, IconCircle, Screen, Text } from '../../src/components/ui';
import { relativeTime, titleCase } from '../../src/lib/format';
import { useThreads } from '../../src/lib/hooks';
import { MessageCircle } from 'lucide-react-native';

const CATEGORY_TONE = {
  side_effect: 'warning',
  refill: 'info',
  dose: 'brand',
  lab: 'accent',
  appointment: 'accent',
  general: 'neutral',
} as const;

export default function MessagesScreen() {
  const router = useRouter();
  const threads = useThreads();

  return (
    <Screen
      tabBar
      header={
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="h1">Messages</Text>
          <Pressable
            onPress={() => router.push('/new-message')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: color.primary,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: radius.full,
            }}
          >
            <PenLine size={15} color={color.onPrimary} />
            <Text variant="bodySm" textColor={color.onPrimary}>
              New
            </Text>
          </Pressable>
        </View>
      }
    >
      {!threads.data ? (
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      ) : threads.data.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={26} color={color.textMuted} />}
          title="No messages yet"
          message="Start a conversation with your care team — they're here to help."
        />
      ) : (
        <Card padded={false}>
          {threads.data
            .sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt))
            .map((t, idx) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <View key={t.id}>
                  {idx > 0 && (
                    <View style={{ height: 1, backgroundColor: color.border, marginLeft: 64 }} />
                  )}
                  <Pressable
                    onPress={() => router.push(`/thread/${t.id}`)}
                    style={({ pressed }) => [
                      { flexDirection: 'row', gap: 12, padding: 16 },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <IconCircle bg={t.urgent ? color.dangerSoft : color.primarySoft}>
                      <MessageCircle
                        size={20}
                        color={t.urgent ? color.danger : color.primary}
                      />
                    </IconCircle>
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text variant="title" style={{ flex: 1 }} numberOfLines={1}>
                          {t.subject}
                        </Text>
                        {t.unread && (
                          <View
                            style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color.accent }}
                          />
                        )}
                      </View>
                      <Text variant="bodySm" tone="muted" numberOfLines={1}>
                        {last?.authorRole === 'patient' ? 'You: ' : ''}
                        {last?.body}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <Badge label={titleCase(t.category)} tone={CATEGORY_TONE[t.category]} />
                        <Text variant="caption" tone="muted">
                          {relativeTime(t.lastMessageAt)}
                        </Text>
                      </View>
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
