import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { FileText, FlaskConical, Paperclip, X } from 'lucide-react-native';
import type { DocumentKind, FileAttachment } from '@beacon/domain';
import { color, radius } from '../src/theme';
import { Button, Card, IconCircle, Text, TextField } from '../src/components/ui';
import { useUploadDocument, useUploadLabResult } from '../src/lib/hooks';

type RecordType = 'lab' | 'document';

const DOCUMENT_KINDS: { value: DocumentKind; label: string }[] = [
  { value: 'lab', label: 'Lab report' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'visit_summary', label: 'Visit summary' },
  { value: 'other', label: 'Other' },
];

export default function UploadRecord() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ panelId?: string; panelName?: string; type?: string }>();
  const fulfillsPanel = typeof params.panelId === 'string' && params.panelId.length > 0;

  const uploadLab = useUploadLabResult();
  const uploadDocument = useUploadDocument();

  const [recordType, setRecordType] = useState<RecordType>(
    params.type === 'document' ? 'document' : 'lab',
  );
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<DocumentKind>('lab');
  const [file, setFile] = useState<FileAttachment | null>(null);
  const [pickError, setPickError] = useState(false);

  const isLab = fulfillsPanel || recordType === 'lab';
  const pending = uploadLab.isPending || uploadDocument.isPending;
  const canSubmit = !!file && (fulfillsPanel || title.trim().length > 0) && !pending;

  const pickFile = async () => {
    setPickError(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: false,
      });
      const asset = result.assets?.[0];
      if (!asset) return;
      setFile({
        fileName: asset.name,
        sizeKb: asset.size ? Math.max(1, Math.round(asset.size / 1024)) : undefined,
      });
    } catch {
      setPickError(true);
    }
  };

  const submit = () => {
    if (!file) return;
    const onSuccess = () => router.back();
    if (isLab) {
      uploadLab.mutate(
        fulfillsPanel
          ? { panelId: params.panelId, attachment: file }
          : { name: title.trim(), attachment: file },
        { onSuccess },
      );
    } else {
      uploadDocument.mutate({ title: title.trim(), kind, attachment: file }, { onSuccess });
    }
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
        <Text variant="h2">{fulfillsPanel ? 'Upload results' : 'Upload a record'}</Text>
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
        {fulfillsPanel ? (
          <Card variant="tinted">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconCircle bg={color.infoSoft}>
                <FlaskConical size={20} color={color.info} />
              </IconCircle>
              <View style={{ flex: 1 }}>
                <Text variant="title">{params.panelName ?? 'Requested lab panel'}</Text>
                <Text variant="bodySm" tone="muted">
                  Requested by your clinic
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <>
            <Text variant="body" tone="secondary">
              Share outside lab results or paperwork with your care team. They&apos;ll review
              anything you upload.
            </Text>
            <View>
              <Text variant="bodySm" tone="secondary" style={{ marginBottom: 8 }}>
                What is it?
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(
                  [
                    { value: 'lab', label: 'Lab results' },
                    { value: 'document', label: 'Document' },
                  ] as const
                ).map((t) => {
                  const on = recordType === t.value;
                  return (
                    <Pressable
                      key={t.value}
                      onPress={() => setRecordType(t.value)}
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
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {!fulfillsPanel && !isLab && (
          <View>
            <Text variant="bodySm" tone="secondary" style={{ marginBottom: 8 }}>
              Document type
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {DOCUMENT_KINDS.map((k) => {
                const on = kind === k.value;
                return (
                  <Pressable
                    key={k.value}
                    onPress={() => setKind(k.value)}
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
                      {k.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {!fulfillsPanel && (
          <Card>
            <TextField
              label={isLab ? 'What lab is this?' : 'Title'}
              placeholder={isLab ? 'e.g. Lipid Panel — Quest' : 'e.g. Prior prescription'}
              value={title}
              onChangeText={setTitle}
            />
          </Card>
        )}

        <View>
          <Text variant="bodySm" tone="secondary" style={{ marginBottom: 8 }}>
            File
          </Text>
          {file ? (
            <Card variant="flat">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <IconCircle bg={color.primarySoft}>
                  <FileText size={19} color={color.primary} />
                </IconCircle>
                <View style={{ flex: 1 }}>
                  <Text variant="title" numberOfLines={1}>
                    {file.fileName}
                  </Text>
                  {file.sizeKb ? (
                    <Text variant="bodySm" tone="muted">
                      {file.sizeKb >= 1024 ? `${(file.sizeKb / 1024).toFixed(1)} MB` : `${file.sizeKb} KB`}
                    </Text>
                  ) : null}
                </View>
                <Pressable onPress={() => setFile(null)} hitSlop={8}>
                  <X size={18} color={color.textMuted} />
                </Pressable>
              </View>
            </Card>
          ) : (
            <Button
              label="Choose a PDF or photo"
              variant="secondary"
              fullWidth
              icon={<Paperclip size={18} color={color.textPrimary} />}
              onPress={() => void pickFile()}
            />
          )}
          {pickError && (
            <Text variant="bodySm" tone="danger" style={{ marginTop: 8 }}>
              Couldn&apos;t open the file picker. Please try again.
            </Text>
          )}
        </View>
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
          label={isLab ? 'Send to my care team' : 'Upload document'}
          fullWidth
          size="lg"
          disabled={!canSubmit}
          loading={pending}
          onPress={submit}
        />
      </View>
    </View>
  );
}
