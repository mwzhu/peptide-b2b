import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import type { MessageCategory } from '@beacon/domain';
import { color, radius } from '../src/theme';
import { Button, Card, Text, TextField } from '../src/components/ui';
import { useStartThread } from '../src/lib/hooks';

const CATEGORIES: { value: MessageCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'dose', label: 'Dosing' },
  { value: 'side_effect', label: 'Side effect' },
  { value: 'refill', label: 'Refill' },
  { value: 'lab', label: 'Labs' },
  { value: 'appointment', label: 'Appointment' },
];

export default function NewMessage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const startThread = useStartThread();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<MessageCategory>('general');
  const [body, setBody] = useState('');

  const submit = () => {
    if (!subject.trim() || !body.trim()) return;
    startThread.mutate(
      { subject: subject.trim(), category, body: body.trim() },
      { onSuccess: (thread) => router.replace(`/thread/${thread.id}`) },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 6 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingBottom: 8,
        }}
      >
        <Text variant="h2">New message</Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: color.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={19} color={color.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="body" tone="secondary">
          Your care team at Solstice Wellness typically replies within a few hours.
        </Text>

        <View>
          <Text variant="bodySm" tone="secondary" style={{ marginBottom: 8 }}>
            Topic
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((c) => {
              const on = category === c.value;
              return (
                <Pressable
                  key={c.value}
                  onPress={() => setCategory(c.value)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: radius.full,
                    borderWidth: 1.5,
                    borderColor: on ? color.primary : color.border,
                    backgroundColor: on ? color.primary : color.surface,
                  }}
                >
                  <Text variant="bodySm" textColor={on ? color.onPrimary : color.textSecondary}>
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card>
          <View style={{ gap: 14 }}>
            <TextField label="Subject" placeholder="What's this about?" value={subject} onChangeText={setSubject} />
            <TextField
              label="Message"
              placeholder="Share the details with your care team…"
              value={body}
              onChangeText={setBody}
              multiline
            />
          </View>
        </Card>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          borderTopWidth: 1,
          borderTopColor: color.border,
        }}
      >
        <Button
          label="Send message"
          fullWidth
          size="lg"
          disabled={!subject.trim() || !body.trim()}
          loading={startThread.isPending}
          onPress={submit}
        />
      </View>
    </View>
  );
}
