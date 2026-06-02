import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { SendHorizonal } from 'lucide-react-native';
import { color, font, radius } from '../../src/theme';
import { Avatar, Header, Screen, Text } from '../../src/components/ui';
import { formatTime, relativeTime } from '../../src/lib/format';
import { useSendMessage, useStaff, useThread } from '../../src/lib/hooks';

export default function ThreadScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const thread = useThread(params.id);
  const staff = useStaff();
  const sendMessage = useSendMessage();
  const [draft, setDraft] = useState('');

  const staffName = (id: string) => staff.data?.find((s) => s.id === id)?.name ?? 'Care team';
  const staffHue = (id: string) => staff.data?.find((s) => s.id === id)?.avatarHue ?? 160;

  const send = () => {
    const body = draft.trim();
    if (!body || !thread.data) return;
    setDraft('');
    sendMessage.mutate({ threadId: thread.data.id, body });
  };

  if (!thread.data) {
    return (
      <Screen header={<Header showBack title="Conversation" />}>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const t = thread.data;

  return (
    <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
        <Header showBack subtitle="Conversation" title={t.subject} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          {t.messages.map((m) => {
            const mine = m.authorRole === 'patient';
            return (
              <View
                key={m.id}
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  maxWidth: '86%',
                }}
              >
                {!mine && <Avatar name={staffName(m.authorId)} hue={staffHue(m.authorId)} size={34} />}
                <View style={{ flex: 1 }}>
                  {!mine && (
                    <Text variant="caption" tone="muted" style={{ marginBottom: 3, marginLeft: 4 }}>
                      {staffName(m.authorId)}
                    </Text>
                  )}
                  <View
                    style={{
                      backgroundColor: mine ? color.primary : color.surface,
                      borderWidth: mine ? 0 : 1,
                      borderColor: color.border,
                      borderRadius: radius.xl,
                      borderBottomRightRadius: mine ? 6 : radius.xl,
                      borderBottomLeftRadius: mine ? radius.xl : 6,
                      padding: 13,
                    }}
                  >
                    <Text variant="body" textColor={mine ? color.onPrimary : color.textPrimary}>
                      {m.body}
                    </Text>
                  </View>
                  <Text
                    variant="caption"
                    tone="muted"
                    style={{ marginTop: 3, marginHorizontal: 4, textAlign: mine ? 'right' : 'left' }}
                  >
                    {formatTime(m.sentAt)} · {relativeTime(m.sentAt)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Composer */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 10,
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: insets.bottom + 10,
            borderTopWidth: 1,
            borderTopColor: color.border,
            backgroundColor: color.canvas,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: color.surface,
              borderRadius: radius.xl,
              borderWidth: 1,
              borderColor: color.border,
              paddingHorizontal: 14,
              paddingVertical: 10,
              maxHeight: 120,
            }}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Message your care team…"
              placeholderTextColor={color.textMuted}
              multiline
              style={{ fontFamily: font.body, fontSize: 15, color: color.textPrimary, maxHeight: 100 }}
            />
          </View>
          <Pressable
            onPress={send}
            disabled={!draft.trim()}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: draft.trim() ? color.primary : color.surfaceSunken,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SendHorizonal size={20} color={draft.trim() ? color.onPrimary : color.textMuted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
