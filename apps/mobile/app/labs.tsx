import { ActivityIndicator, View } from 'react-native';
import { FileText, FlaskConical, MessageSquareText, PenLine } from 'lucide-react-native';
import type { LabValue } from '@beacon/domain';
import { color, radius } from '../src/theme';
import {
  Badge,
  Card,
  Header,
  IconCircle,
  SectionHeader,
  Screen,
  Text,
} from '../src/components/ui';
import { formatDate, titleCase } from '../src/lib/format';
import { useDocuments, useLabs } from '../src/lib/hooks';

const FLAG_TONE = { low: 'info', normal: 'success', high: 'danger' } as const;

export default function Labs() {
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

  return (
    <Screen header={<Header showBack subtitle="Your records" title="Labs & documents" />}>
      {/* Labs */}
      <SectionHeader title="Lab results" />
      {labs.data.map((panel) => (
        <Card key={panel.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconCircle bg={color.infoSoft}>
              <FlaskConical size={20} color={color.info} />
            </IconCircle>
            <View style={{ flex: 1 }}>
              <Text variant="title">{panel.name}</Text>
              <Text variant="bodySm" tone="muted">
                {panel.resultedOn ? `Resulted ${formatDate(panel.resultedOn)}` : `Ordered ${formatDate(panel.orderedOn)}`}
              </Text>
            </View>
            <Badge
              label={titleCase(panel.status)}
              tone={panel.status === 'released' ? 'success' : 'neutral'}
            />
          </View>

          <View style={{ marginTop: 14, gap: 4 }}>
            {panel.values.map((v) => (
              <LabRow key={v.name} value={v} />
            ))}
          </View>

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
      ))}

      {/* Documents */}
      <View>
        <SectionHeader title="Documents & consents" />
        <Card padded={false}>
          {documents.data.map((d, idx) => (
            <View key={d.id}>
              {idx > 0 && <View style={{ height: 1, backgroundColor: color.border, marginLeft: 62 }} />}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
                <IconCircle bg={color.primarySoft}>
                  <FileText size={19} color={color.primary} />
                </IconCircle>
                <View style={{ flex: 1 }}>
                  <Text variant="title">{d.title}</Text>
                  <Text variant="bodySm" tone="muted">
                    {titleCase(d.kind)} · {formatDate(d.createdAt)}
                  </Text>
                </View>
                {d.signed ? (
                  <Badge label="Signed" tone="success" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <PenLine size={14} color={color.accent} />
                    <Text variant="bodySm" tone="accent">
                      Sign
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
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
