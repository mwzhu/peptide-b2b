import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Check, TriangleAlert, X } from 'lucide-react-native';
import type { SymptomSeverity } from '@beacon/domain';
import { color, radius } from '../src/theme';
import { Button, Card, IconCircle, Text, TextField } from '../src/components/ui';
import { useAddSideEffect } from '../src/lib/hooks';

const SYMPTOMS = [
  'Nausea',
  'Headache',
  'Fatigue',
  'Injection-site reaction',
  'Appetite change',
  'Mood change',
  'Sleep change',
  'Dizziness',
  'Constipation',
  'Other',
];

const SEVERITY: { value: SymptomSeverity; label: string; detail: string; tone: string; soft: string }[] = [
  { value: 'mild', label: 'Mild', detail: 'Noticeable but not bothersome', tone: color.success, soft: color.successSoft },
  { value: 'moderate', label: 'Moderate', detail: 'Uncomfortable, affecting my day', tone: color.warning, soft: color.warningSoft },
  { value: 'severe', label: 'Severe', detail: 'Hard to manage — I need help', tone: color.danger, soft: color.dangerSoft },
];

export default function ReportSymptom() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addSideEffect = useAddSideEffect();
  const [type, setType] = useState<string>();
  const [severity, setSeverity] = useState<SymptomSeverity>();
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!type || !severity) return;
    addSideEffect.mutate(
      { type, severity, note: note.trim() || undefined },
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
        <Text variant="h2">Report a symptom</Text>
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
          <IconCircle size={88} bg={severity === 'severe' ? color.dangerSoft : color.successSoft}>
            {severity === 'severe' ? (
              <TriangleAlert size={40} color={color.danger} />
            ) : (
              <Check size={42} color={color.success} strokeWidth={3} />
            )}
          </IconCircle>
          <Text variant="h1" center>
            {severity === 'severe' ? 'Your clinic is notified' : 'Symptom logged'}
          </Text>
          <Text variant="body" tone="secondary" center>
            {severity === 'severe'
              ? 'We’ve flagged this to your care team right away. If this is a medical emergency, call 911.'
              : 'Thanks for letting us know. Your care team can see this and will follow up if needed.'}
          </Text>
          <View style={{ height: 8 }} />
          <Button label="Done" fullWidth size="lg" onPress={() => router.back()} />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <View>
              <Text variant="title" style={{ marginBottom: 10 }}>
                What are you experiencing?
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SYMPTOMS.map((s) => {
                  const on = type === s;
                  return (
                    <Pressable
                      key={s}
                      onPress={() => setType(s)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: radius.full,
                        borderWidth: 1.5,
                        borderColor: on ? color.primary : color.border,
                        backgroundColor: on ? color.primary : color.surface,
                      }}
                    >
                      <Text variant="bodySm" textColor={on ? color.onPrimary : color.textSecondary}>
                        {s}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View>
              <Text variant="title" style={{ marginBottom: 10 }}>
                How severe is it?
              </Text>
              <View style={{ gap: 8 }}>
                {SEVERITY.map((s) => {
                  const on = severity === s.value;
                  return (
                    <Pressable
                      key={s.value}
                      onPress={() => setSeverity(s.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 14,
                        borderRadius: radius.xl,
                        borderWidth: 1.5,
                        borderColor: on ? s.tone : color.border,
                        backgroundColor: on ? s.soft : color.surface,
                      }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          borderWidth: 2,
                          borderColor: on ? s.tone : color.borderStrong,
                          backgroundColor: on ? s.tone : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {on && <Check size={13} color="#FFF" strokeWidth={3} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="title">{s.label}</Text>
                        <Text variant="bodySm" tone="muted">
                          {s.detail}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Card>
              <TextField
                label="Describe it (optional)"
                placeholder="When it started, how it feels…"
                value={note}
                onChangeText={setNote}
                multiline
              />
            </Card>

            {severity === 'severe' && (
              <Card variant="flat" style={{ borderColor: color.danger, backgroundColor: color.dangerSoft }}>
                <Text variant="bodySm" tone="secondary">
                  Reporting this as severe will alert your care team immediately. For a
                  medical emergency, call 911.
                </Text>
              </Card>
            )}
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
              label="Submit report"
              fullWidth
              size="lg"
              disabled={!type || !severity}
              loading={addSideEffect.isPending}
              onPress={submit}
            />
          </View>
        </>
      )}
    </View>
  );
}
