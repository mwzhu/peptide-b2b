import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BatteryFull, Check, Moon, Smile, Soup, X } from 'lucide-react-native';
import { color, radius } from '../src/theme';
import { Button, Card, IconCircle, Text, TextField } from '../src/components/ui';
import { ME, useAddCheckIn } from '../src/lib/hooks';

const METRICS = [
  { key: 'energy', label: 'Energy', Icon: BatteryFull, tint: color.successSoft, fg: color.success },
  { key: 'sleep', label: 'Sleep quality', Icon: Moon, tint: color.infoSoft, fg: color.info },
  { key: 'mood', label: 'Mood', Icon: Smile, tint: color.primarySoft, fg: color.primary },
  { key: 'appetite', label: 'Appetite', Icon: Soup, tint: color.accentSoft, fg: color.accent },
] as const;

export default function CheckIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addCheckIn = useAddCheckIn();
  const [scores, setScores] = useState<Record<string, number>>({
    energy: 4,
    sleep: 3,
    mood: 4,
    appetite: 3,
  });
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const submit = () => {
    addCheckIn.mutate(
      {
        patientId: ME,
        date: new Date().toISOString().slice(0, 10),
        energy: scores.energy!,
        sleep: scores.sleep!,
        mood: scores.mood!,
        appetite: scores.appetite!,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setDone(true);
        },
      },
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
        <Text variant="h2">Daily check-in</Text>
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

      {done ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 }}>
          <IconCircle size={88} bg={color.successSoft}>
            <Check size={42} color={color.success} strokeWidth={3} />
          </IconCircle>
          <Text variant="h1" center>
            Thanks for checking in
          </Text>
          <Text variant="body" tone="secondary" center>
            Tracking how you feel each day helps you and your care team see the full picture.
          </Text>
          <View style={{ height: 8 }} />
          <Button label="Done" fullWidth size="lg" onPress={() => router.back()} />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 14 }}
            showsVerticalScrollIndicator={false}
          >
            <Text variant="body" tone="secondary">
              How are you feeling today? Tap a rating for each.
            </Text>
            {METRICS.map((m) => (
              <Card key={m.key}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <IconCircle size={38} bg={m.tint}>
                    <m.Icon size={18} color={m.fg} />
                  </IconCircle>
                  <Text variant="title">{m.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = scores[m.key]! >= n;
                    return (
                      <Pressable
                        key={n}
                        onPress={() => setScores((s) => ({ ...s, [m.key]: n }))}
                        style={{
                          flex: 1,
                          height: 44,
                          borderRadius: radius.md,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: active ? m.fg : color.surfaceSunken,
                        }}
                      >
                        <Text variant="title" textColor={active ? '#FFF' : color.textMuted}>
                          {n}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
            ))}
            <Card>
              <TextField
                label="Notes (optional)"
                placeholder="Anything else you'd like to share…"
                value={note}
                onChangeText={setNote}
                multiline
              />
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
              label="Submit check-in"
              fullWidth
              size="lg"
              loading={addCheckIn.isPending}
              onPress={submit}
            />
          </View>
        </>
      )}
    </View>
  );
}
