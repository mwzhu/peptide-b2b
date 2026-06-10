import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileSignature, X } from 'lucide-react-native';
import { color, radius } from '../src/theme';
import { Button, Card, IconCircle, Text, TextField } from '../src/components/ui';
import { formatDate, titleCase } from '../src/lib/format';
import { useDocuments, useMe, useSignDocument } from '../src/lib/hooks';

const AGREEMENT_COPY =
  'By signing, you confirm that you have read and understood this document, that your ' +
  'questions have been answered, and that you agree to its terms. Your electronic ' +
  'signature is as binding as a handwritten one, and a signed copy stays available ' +
  'here in your records.';

export default function SignDocument() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe();
  const documents = useDocuments();
  const signDocument = useSignDocument();
  const [name, setName] = useState('');

  const doc = documents.data?.find((d) => d.id === id);
  const expected = me.data ? `${me.data.firstName} ${me.data.lastName}` : '';
  const nameMatches = name.trim().toLowerCase() === expected.toLowerCase();

  const submit = () => {
    if (!doc) return;
    signDocument.mutate(doc.id, { onSuccess: () => router.back() });
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
        <Text variant="h2">Review &amp; sign</Text>
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
        {doc ? (
          <>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <IconCircle bg={color.primarySoft}>
                  <FileSignature size={20} color={color.primary} />
                </IconCircle>
                <View style={{ flex: 1 }}>
                  <Text variant="title">{doc.title}</Text>
                  <Text variant="bodySm" tone="muted">
                    {titleCase(doc.kind)} · Sent {formatDate(doc.createdAt)}
                  </Text>
                </View>
              </View>
            </Card>

            <View
              style={{
                padding: 16,
                backgroundColor: color.surfaceSunken,
                borderRadius: radius.lg,
              }}
            >
              <Text variant="bodySm" tone="secondary">
                {AGREEMENT_COPY}
              </Text>
            </View>

            <Card>
              <TextField
                label="Sign by typing your full name"
                placeholder={expected || 'Your full name'}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                hint={
                  name.trim() && !nameMatches
                    ? `Must match the name on file: ${expected}`
                    : undefined
                }
              />
            </Card>
          </>
        ) : (
          <Text variant="body" tone="muted">
            This document is no longer available.
          </Text>
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
          label="Agree & sign"
          fullWidth
          size="lg"
          disabled={!doc || !nameMatches}
          loading={signDocument.isPending}
          onPress={submit}
        />
      </View>
    </View>
  );
}
