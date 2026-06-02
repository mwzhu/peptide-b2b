import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Check,
  Compass,
  Dumbbell,
  HeartPulse,
  Leaf,
  Moon,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react-native';
import { color, nativeShadow, radius } from '../src/theme';
import { Button, Card, Text, TextField } from '../src/components/ui';

const GOALS = [
  { id: 'weight_loss', label: 'Weight management', Icon: Target },
  { id: 'recovery', label: 'Recovery & repair', Icon: HeartPulse },
  { id: 'sleep', label: 'Sleep & restoration', Icon: Moon },
  { id: 'performance', label: 'Performance', Icon: Dumbbell },
  { id: 'longevity', label: 'Longevity', Icon: Leaf },
  { id: 'skin', label: 'Skin & hair', Icon: Sparkles },
];

const CONSENTS = [
  { id: 'treatment', label: 'Peptide therapy treatment consent', detail: 'I consent to the treatment plan prescribed by my clinic.' },
  { id: 'telehealth', label: 'Telehealth consent', detail: 'I consent to care delivered via telehealth visits.' },
  { id: 'data', label: 'Data & privacy acknowledgement', detail: 'I understand how Beacon stores and protects my health data.' },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('SOLSTICE-7421');
  const [goals, setGoals] = useState<string[]>(['weight_loss', 'performance']);
  const [consents, setConsents] = useState<string[]>([]);
  const [weight, setWeight] = useState('186');

  const TOTAL = 5;
  const next = () => (step < TOTAL - 1 ? setStep(step + 1) : router.replace('/(tabs)'));

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const canContinue =
    step === 0
      ? code.trim().length > 4
      : step === 1
        ? consents.length === CONSENTS.length
        : step === 2
          ? goals.length > 0
          : true;

  return (
    <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 8 }}>
      {/* Progress */}
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 24, marginBottom: 8 }}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              backgroundColor: i <= step ? color.primary : color.surfaceSunken,
            }}
          />
        ))}
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        {step === 0 && (
          <StepShell
            icon={<Compass size={30} color={color.onPrimary} />}
            eyebrow="Welcome to Beacon"
            title="Your peptide journey, beautifully guided."
            body="Beacon keeps your protocol, dosing, and progress in one calm place — connected directly to your care team at Solstice Wellness."
          >
            <TextField
              label="Clinic invite code"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              hint="Find this in the invitation from your clinic."
            />
          </StepShell>
        )}

        {step === 1 && (
          <StepShell
            icon={<ShieldCheck size={30} color={color.onPrimary} />}
            eyebrow="Consent & privacy"
            title="A few agreements before we begin."
            body="Your provider has prepared these for you. Tap each to acknowledge."
          >
            <View style={{ gap: 10 }}>
              {CONSENTS.map((c) => {
                const on = consents.includes(c.id);
                return (
                  <Card
                    key={c.id}
                    variant={on ? 'tinted' : 'flat'}
                    onPress={() => toggle(consents, setConsents, c.id)}
                  >
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: on ? color.primary : color.borderStrong,
                          backgroundColor: on ? color.primary : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 1,
                        }}
                      >
                        {on && <Check size={15} color={color.onPrimary} strokeWidth={3} />}
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="title">{c.label}</Text>
                        <Text variant="bodySm" tone="muted">
                          {c.detail}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            icon={<Target size={30} color={color.onPrimary} />}
            eyebrow="Your goals"
            title="What are you hoping to achieve?"
            body="This helps your clinic personalize your experience. Choose any that apply."
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {GOALS.map((g) => {
                const on = goals.includes(g.id);
                const { Icon } = g;
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => toggle(goals, setGoals, g.id)}
                    style={{
                      width: '47.5%',
                      borderRadius: radius.xl,
                      borderWidth: 1.5,
                      borderColor: on ? color.primary : color.border,
                      backgroundColor: on ? color.primarySoft : color.surface,
                      padding: 16,
                      gap: 10,
                    }}
                  >
                    <Icon size={22} color={on ? color.primary : color.textMuted} />
                    <Text variant="title">{g.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            icon={<HeartPulse size={30} color={color.onPrimary} />}
            eyebrow="Your baseline"
            title="Let's capture a starting point."
            body="A simple baseline lets you and your provider see real progress over time."
          >
            <View style={{ gap: 14 }}>
              <TextField label="Current weight" value={weight} onChangeText={setWeight} keyboardType="numeric" suffix="lb" />
              <Card variant="tinted">
                <Text variant="bodySm" tone="secondary">
                  You'll be able to add progress photos, measurements, and lab results once
                  you're inside Beacon.
                </Text>
              </Card>
            </View>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            icon={<Sparkles size={30} color={color.onPrimary} />}
            eyebrow="You're all set"
            title="Welcome aboard, Avery."
            body="Your Metabolic Reset protocol is ready and waiting. Your care team will be with you every step of the way."
          >
            <Card variant="tinted">
              <View style={{ gap: 8 }}>
                <Text variant="overline" tone="muted">
                  WHAT'S NEXT
                </Text>
                {['Review your protocol & dosing schedule', 'Set up your first vial with the reconstitution guide', 'Log your doses and track how you feel'].map(
                  (t) => (
                    <View key={t} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Check size={16} color={color.primary} strokeWidth={3} />
                      <Text variant="bodySm" tone="secondary">
                        {t}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </Card>
          </StepShell>
        )}
      </View>

      {/* Footer */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 10,
          paddingBottom: insets.bottom + 14,
          gap: 10,
        }}
      >
        <Button
          label={step === TOTAL - 1 ? 'Enter Beacon' : 'Continue'}
          fullWidth
          size="lg"
          disabled={!canContinue}
          onPress={next}
          iconRight={<ArrowRight size={18} color={color.onPrimary} />}
        />
        {step === 0 && (
          <Pressable onPress={() => router.replace('/(tabs)')}>
            <Text variant="bodySm" tone="muted" center>
              Skip for now
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function StepShell({
  icon,
  eyebrow,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1, gap: 18 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radius.xl,
          backgroundColor: color.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...nativeShadow.md,
        }}
      >
        {icon}
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="overline" tone="brand">
          {eyebrow.toUpperCase()}
        </Text>
        <Text variant="h1">{title}</Text>
        <Text variant="body" tone="secondary">
          {body}
        </Text>
      </View>
      <View style={{ marginTop: 4 }}>{children}</View>
    </View>
  );
}
