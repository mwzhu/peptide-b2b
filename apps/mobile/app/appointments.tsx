import { ActivityIndicator, Linking, View } from 'react-native';
import {
  CalendarDays,
  CalendarPlus,
  CircleCheck,
  ClipboardList,
  Video,
} from 'lucide-react-native';
import type { AppointmentType } from '@beacon/domain';
import { color } from '../src/theme';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Header,
  IconCircle,
  SectionHeader,
  Screen,
  Text,
} from '../src/components/ui';
import { formatLongDate, formatTime, relativeTime } from '../src/lib/format';
import { useAppointments, useStaff } from '../src/lib/hooks';

const TYPE_LABEL: Record<AppointmentType, string> = {
  follow_up: 'Follow-up visit',
  initial_consult: 'Initial consultation',
  lab_review: 'Lab review',
  check_in: 'Progress check-in',
};

export default function Appointments() {
  const appointments = useAppointments();
  const staff = useStaff();

  if (!appointments.data) {
    return (
      <Screen header={<Header showBack title="Appointments" />}>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  const providerName = (id: string) => staff.data?.find((s) => s.id === id)?.name ?? 'Your provider';
  const upcoming = appointments.data
    .filter((a) => a.status === 'scheduled')
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
  const past = appointments.data
    .filter((a) => a.status !== 'scheduled')
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));
  const next = upcoming[0];

  return (
    <Screen
      header={<Header showBack title="Appointments" />}
      footer={<Button label="Request an appointment" fullWidth icon={<CalendarPlus size={17} color={color.onPrimary} />} />}
    >
      {/* Next visit hero */}
      {next ? (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="overline" tone="muted">
              YOUR NEXT VISIT
            </Text>
            <Badge label={relativeTime(next.startsAt)} tone="brand" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 }}>
            <IconCircle bg={color.accentSoft} size={52}>
              <CalendarDays size={24} color={color.accent} />
            </IconCircle>
            <View style={{ flex: 1 }}>
              <Text variant="h3">{TYPE_LABEL[next.type]}</Text>
              <Text variant="bodySm" tone="muted">
                with {providerName(next.providerId)}
              </Text>
            </View>
          </View>
          <View
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: color.border,
              gap: 10,
            }}
          >
            <Row icon={<CalendarDays size={16} color={color.textMuted} />} text={`${formatLongDate(next.startsAt)} · ${formatTime(next.startsAt)}`} />
            <Row
              icon={<ClipboardList size={16} color={next.preVisitComplete ? color.success : color.warning} />}
              text={next.preVisitComplete ? 'Pre-visit questionnaire complete' : 'Pre-visit questionnaire pending'}
            />
          </View>
          {next.telehealthUrl && (
            <View style={{ marginTop: 14 }}>
              <Button
                label="Join telehealth visit"
                fullWidth
                icon={<Video size={17} color={color.onPrimary} />}
                onPress={() => next.telehealthUrl && Linking.openURL(next.telehealthUrl)}
              />
            </View>
          )}
        </Card>
      ) : (
        <EmptyState
          icon={<CalendarDays size={26} color={color.textMuted} />}
          title="No upcoming visits"
          message="Request an appointment and it will appear here."
        />
      )}

      {/* Other upcoming */}
      {upcoming.length > 1 && (
        <View>
          <SectionHeader title="Also scheduled" />
          <Card padded={false}>
            {upcoming.slice(1).map((a, idx) => (
              <View key={a.id}>
                {idx > 0 && <View style={{ height: 1, backgroundColor: color.border, marginLeft: 62 }} />}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
                  <IconCircle bg={color.surfaceSunken}>
                    <CalendarDays size={18} color={color.textMuted} />
                  </IconCircle>
                  <View style={{ flex: 1 }}>
                    <Text variant="title">{TYPE_LABEL[a.type]}</Text>
                    <Text variant="bodySm" tone="muted">
                      {formatLongDate(a.startsAt)} · {formatTime(a.startsAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Past */}
      {past.length > 0 && (
        <View>
          <SectionHeader title="Past visits" />
          <Card padded={false}>
            {past.map((a, idx) => (
              <View key={a.id}>
                {idx > 0 && <View style={{ height: 1, backgroundColor: color.border, marginLeft: 62 }} />}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
                  <IconCircle bg={color.successSoft}>
                    <CircleCheck size={18} color={color.success} />
                  </IconCircle>
                  <View style={{ flex: 1 }}>
                    <Text variant="title">{TYPE_LABEL[a.type]}</Text>
                    <Text variant="bodySm" tone="muted">
                      {formatLongDate(a.startsAt)}
                    </Text>
                  </View>
                  <Badge label="Completed" tone="success" />
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}
    </Screen>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {icon}
      <Text variant="bodySm" tone="secondary">
        {text}
      </Text>
    </View>
  );
}
