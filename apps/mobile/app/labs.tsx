import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  FileText,
  FileUp,
  FlaskConical,
  Hourglass,
  MessageSquareText,
  Paperclip,
  PenLine,
} from 'lucide-react-native';
import type { ClinicDocument, LabPanel, LabValue } from '@beacon/domain';
import { color, radius } from '../src/theme';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Header,
  IconButton,
  IconCircle,
  SectionHeader,
  Screen,
  Text,
} from '../src/components/ui';
import { formatDate, titleCase } from '../src/lib/format';
import { useDocuments, useLabs } from '../src/lib/hooks';

const FLAG_TONE = { low: 'info', normal: 'success', high: 'danger' } as const;

export default function Labs() {
  const router = useRouter();
  const labs = useLabs();
  const documents = useDocuments();

  if (!labs.data || !documents.data) {
    return (
      <Screen header={<Header showBack title="Labs & documents" />}>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const requested = labs.data.filter((p) => p.status === 'ordered' || p.status === 'collected');
  const results = labs.data.filter((p) => p.status === 'resulted' || p.status === 'released');

  return (
    <Screen
      header={
        <Header
          showBack
          subtitle="Your records"
          title="Labs & documents"
          right={
            <IconButton tone="tinted" onPress={() => router.push('/upload-record')}>
              <FileUp size={19} color={color.primary} />
            </IconButton>
          }
        />
      }
    >
      {/* Requested labs — the clinic is waiting on these */}
      {requested.length > 0 && (
        <View>
          <SectionHeader title="Requested by your clinic" />
          {requested.map((panel) => (
            <Card key={panel.id} variant="tinted" style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <IconCircle bg={color.warningSoft}>
                  <Hourglass size={19} color={color.warning} />
                </IconCircle>
                <View style={{ flex: 1 }}>
                  <Text variant="title">{panel.name}</Text>
                  <Text variant="bodySm" tone="muted">
                    Requested {formatDate(panel.orderedOn)} · Waiting on your results
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: 12 }}>
                <Button
                  label="Upload results"
                  size="sm"
                  icon={<Paperclip size={15} color={color.onPrimary} />}
                  onPress={() =>
                    router.push({
                      pathname: '/upload-record',
                      params: { panelId: panel.id, panelName: panel.name },
                    })
                  }
                />
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Labs */}
      <SectionHeader
        title="Lab results"
        action={<UploadAction onPress={() => router.push('/upload-record')} />}
      />
      {results.length === 0 ? (
        <Card variant="flat">
          <EmptyState
            icon={<FlaskConical size={24} color={color.textMuted} />}
            title="No lab results yet"
            message="Results your clinic releases — or labs you upload — will appear here."
          />
        </Card>
      ) : (
        results.map((panel) => <LabCard key={panel.id} panel={panel} />)
      )}

      {/* Documents */}
      <View>
        <SectionHeader
          title="Documents & consents"
          action={
            <UploadAction
              onPress={() =>
                router.push({ pathname: '/upload-record', params: { type: 'document' } })
              }
            />
          }
        />
        {documents.data.length === 0 ? (
          <Card variant="flat">
            <EmptyState
              icon={<FileText size={24} color={color.textMuted} />}
              title="No documents yet"
              message="Consents, care plans, and records you upload will be stored here."
            />
          </Card>
        ) : (
          <Card padded={false}>
            {documents.data.map((d, idx) => (
              <View key={d.id}>
                {idx > 0 && (
                  <View style={{ height: 1, backgroundColor: color.border, marginLeft: 62 }} />
                )}
                <DocumentRow
                  doc={d}
                  onSign={() =>
                    router.push({ pathname: '/sign-document', params: { id: d.id } })
                  }
                />
              </View>
            ))}
          </Card>
        )}
      </View>
    </Screen>
  );
}

function UploadAction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => pressed && { opacity: 0.6 }}>
      <Text variant="bodySm" tone="accent">
        Upload
      </Text>
    </Pressable>
  );
}

function LabCard({ panel }: { panel: LabPanel }) {
  const released = panel.status === 'released';
  return (
    <Card style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconCircle bg={color.infoSoft}>
          <FlaskConical size={20} color={color.info} />
        </IconCircle>
        <View style={{ flex: 1 }}>
          <Text variant="title">{panel.name}</Text>
          <Text variant="bodySm" tone="muted">
            {panel.resultedOn
              ? `Resulted ${formatDate(panel.resultedOn)}`
              : `Ordered ${formatDate(panel.orderedOn)}`}
          </Text>
        </View>
        <Badge label={released ? 'Reviewed' : 'In review'} tone={released ? 'success' : 'neutral'} />
      </View>

      {panel.source === 'patient' && (
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Chip label="Uploaded by you" />
        </View>
      )}

      {panel.attachment && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 12,
            padding: 10,
            borderWidth: 1,
            borderColor: color.border,
            borderRadius: radius.lg,
          }}
        >
          <Paperclip size={15} color={color.textMuted} />
          <Text variant="bodySm" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
            {panel.attachment.fileName}
          </Text>
        </View>
      )}

      {panel.values.length > 0 ? (
        <View style={{ marginTop: 14, gap: 4 }}>
          {panel.values.map((v) => (
            <LabRow key={v.name} value={v} />
          ))}
        </View>
      ) : (
        !released && (
          <Text variant="bodySm" tone="muted" style={{ marginTop: 12 }}>
            Your care team is reviewing this and will add results with their comments.
          </Text>
        )
      )}

      {panel.providerComment && (
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 14,
            padding: 12,
            backgroundColor: color.surfaceSunken,
            borderRadius: radius.lg,
          }}
        >
          <MessageSquareText size={16} color={color.primary} style={{ marginTop: 1 }} />
          <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
            {panel.providerComment}
          </Text>
        </View>
      )}
    </Card>
  );
}

function DocumentRow({ doc, onSign }: { doc: ClinicDocument; onSign: () => void }) {
  const needsSignature = !!doc.requiresSignature && !doc.signed;
  const subtitle = [
    titleCase(doc.kind),
    formatDate(doc.createdAt),
    doc.source === 'patient' ? 'Uploaded by you' : null,
    doc.attachment?.fileName ?? null,
  ]
    .filter(Boolean)
    .join(' · ');

  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
      <IconCircle bg={color.primarySoft}>
        <FileText size={19} color={color.primary} />
      </IconCircle>
      <View style={{ flex: 1 }}>
        <Text variant="title">{doc.title}</Text>
        <Text variant="bodySm" tone="muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {doc.requiresSignature ? (
        doc.signed ? (
          <Badge label="Signed" tone="success" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <PenLine size={14} color={color.accent} />
            <Text variant="bodySm" tone="accent">
              Sign
            </Text>
          </View>
        )
      ) : (
        <Badge label="On file" tone="neutral" />
      )}
    </View>
  );

  if (needsSignature) {
    return (
      <Pressable onPress={onSign} style={({ pressed }) => pressed && { opacity: 0.6 }}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

function LabRow({ value }: { value: LabValue }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
        borderTopWidth: 1,
        borderTopColor: color.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="bodySm">{value.name}</Text>
        <Text variant="caption" tone="muted">
          Ref {value.refLow}–{value.refHigh} {value.unit}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 3 }}>
        <Text variant="title" tone={value.flag === 'normal' ? 'primary' : 'danger'}>
          {value.value} {value.unit}
        </Text>
        <Badge label={value.flag} tone={FLAG_TONE[value.flag]} />
      </View>
    </View>
  );
}
