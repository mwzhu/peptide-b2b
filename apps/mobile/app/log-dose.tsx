import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Check, Clock, MapPin, X } from 'lucide-react-native';
import type { InjectionSite } from '@beacon/domain';
import { color, radius } from '../src/theme';
import { Button, Card, IconCircle, Text, TextField } from '../src/components/ui';
import { BodyMap } from '../src/components/BodyMap';
import { formatDose, formatSite, formatTime } from '../src/lib/format';
import { useDoseLogs, useLogDose, useOccurrences, useProducts } from '../src/lib/hooks';

const ROTATION: InjectionSite[] = [
  'abdomen_left',
  'abdomen_right',
  'thigh_left',
  'thigh_right',
  'arm_left',
  'arm_right',
];

export default function LogDose() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ occ?: string }>();
  const occurrences = useOccurrences();
  const products = useProducts();
  const doseLogs = useDoseLogs();
  const logDose = useLogDose();

  const occurrence = useMemo(() => {
    const list = occurrences.data ?? [];
    if (params.occ) return list.find((o) => o.id === params.occ);
    return [...list]
      .filter((o) => o.status === 'due' || o.status === 'upcoming' || o.status === 'late')
      .sort((a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor))[0];
  }, [occurrences.data, params.occ]);

  const product = products.data?.find((p) => p.id === occurrence?.productId);

  // Suggest a site not used in the most recent logs.
  const suggested = useMemo(() => {
    const recent = [...(doseLogs.data ?? [])]
      .sort((a, b) => +new Date(b.takenAt) - +new Date(a.takenAt))
      .slice(0, 2)
      .map((l) => l.site);
    return ROTATION.find((s) => !recent.includes(s)) ?? ROTATION[0];
  }, [doseLogs.data]);

  const [site, setSite] = useState<InjectionSite | undefined>();
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const chosenSite = site ?? suggested;

  const submit = () => {
    if (!occurrence) return;
    logDose.mutate(
      { occurrenceId: occurrence.id, site: chosenSite, note: note.trim() || undefined },
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
      {/* Modal handle + close */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingBottom: 8,
        }}
      >
        <Text variant="h2">{done ? 'Dose logged' : 'Log dose'}</Text>
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
            Nicely done
          </Text>
          <Text variant="body" tone="secondary" center>
            Your {product?.name} dose is logged. Your care team can see your progress, and
            your supply has been updated.
          </Text>
          <View style={{ height: 8 }} />
          <Button label="Back to Today" fullWidth size="lg" onPress={() => router.back()} />
        </View>
      ) : !occurrence || !product ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text variant="title" tone="muted" center>
            No dose is scheduled to log right now.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 14 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Dose summary */}
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <IconCircle bg={color.primarySoft} size={52}>
                  <Text variant="h3" tone="brand">
                    {product.shortName.slice(0, 2)}
                  </Text>
                </IconCircle>
                <View style={{ flex: 1 }}>
                  <Text variant="h3">{product.name}</Text>
                  <Text variant="bodySm" tone="muted">
                    {formatDose(occurrence.dose)} · subcutaneous
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 14,
                  paddingTop: 14,
                  borderTopWidth: 1,
                  borderTopColor: color.border,
                }}
              >
                <Clock size={15} color={color.textMuted} />
                <Text variant="bodySm" tone="secondary">
                  Scheduled for {formatTime(occurrence.scheduledFor)} · logging now
                </Text>
              </View>
            </Card>

            {/* Site picker */}
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <MapPin size={17} color={color.primary} />
                <Text variant="title">Injection site</Text>
              </View>
              <Text variant="bodySm" tone="muted">
                Tap where you injected. Rotating sites keeps your skin healthy.
              </Text>
              <View style={{ marginTop: 8 }}>
                <BodyMap value={site} suggested={suggested} onChange={setSite} />
              </View>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: color.primarySoft,
                  borderRadius: radius.full,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                }}
              >
                <Text variant="bodySm" tone="brand">
                  {formatSite(chosenSite)}
                </Text>
              </View>
            </Card>

            {/* Note */}
            <Card>
              <TextField
                label="Add a note (optional)"
                placeholder="Anything you want your clinic to know…"
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
              label={`Log ${formatDose(occurrence.dose)} dose`}
              fullWidth
              size="lg"
              loading={logDose.isPending}
              onPress={submit}
              icon={<Check size={18} color={color.onPrimary} strokeWidth={3} />}
            />
          </View>
        </>
      )}
    </View>
  );
}
