import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { color, palette, radius } from '../../theme';
import { initials } from '../../lib/format';
import { Text } from './Text';

/* ------------------------------- Badge --------------------------------- */

type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const BADGE: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: color.surfaceSunken, fg: color.textSecondary },
  brand: { bg: color.primarySoft, fg: palette.sage[700] },
  accent: { bg: color.accentSoft, fg: palette.clay[600] },
  success: { bg: color.successSoft, fg: palette.green[700] },
  warning: { bg: color.warningSoft, fg: palette.amber[700] },
  danger: { bg: color.dangerSoft, fg: palette.red[700] },
  info: { bg: color.infoSoft, fg: palette.blue[700] },
};

export function Badge({
  label,
  tone = 'neutral',
  dot,
}: {
  label: string;
  tone?: Tone;
  dot?: boolean;
}) {
  const c = BADGE[tone];
  return (
    <View
      style={{
        backgroundColor: c.bg,
        borderRadius: radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
      }}
    >
      {dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.fg }} />}
      <Text variant="overline" textColor={c.fg}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

/* -------------------------------- Chip --------------------------------- */

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: radius.full,
          borderWidth: 1.5,
          borderColor: selected ? color.primary : color.border,
          backgroundColor: selected ? color.primary : color.surface,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      {icon}
      <Text variant="bodySm" textColor={selected ? color.onPrimary : color.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ------------------------------ Divider -------------------------------- */

export function Divider({ spacing = 0 }: { spacing?: number }) {
  return <View style={{ height: 1, backgroundColor: color.border, marginVertical: spacing }} />;
}

/* ----------------------------- ProgressBar ----------------------------- */

export function ProgressBar({
  value,
  tone = color.primary,
  height = 8,
}: {
  value: number;
  tone?: string;
  height?: number;
}) {
  return (
    <View
      style={{
        height,
        borderRadius: radius.full,
        backgroundColor: color.surfaceSunken,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.min(100, Math.max(0, value * 100))}%`,
          height: '100%',
          borderRadius: radius.full,
          backgroundColor: tone,
        }}
      />
    </View>
  );
}

/* ----------------------------- ProgressRing ---------------------------- */

export function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  tone = color.primary,
  track = color.surfaceSunken,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

/* ------------------------------ IconCircle ----------------------------- */

export function IconCircle({
  children,
  bg = color.primarySoft,
  size = 44,
}: {
  children: ReactNode;
  bg?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.full,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

/* -------------------------------- Avatar ------------------------------- */

export function Avatar({ name, hue, size = 44 }: { name: string; hue: number; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.full,
        backgroundColor: `hsl(${hue}, 38%, 86%)`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="bodySm" textColor={`hsl(${hue}, 42%, 32%)`} style={{ fontSize: size * 0.34 }}>
        {initials(name)}
      </Text>
    </View>
  );
}

/* -------------------------------- Stat --------------------------------- */

export function Stat({
  label,
  value,
  hint,
  tone = 'primary',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'primary' | 'brand' | 'accent';
}) {
  return (
    <View style={{ gap: 2 }}>
      <Text variant="overline" tone="muted">
        {label.toUpperCase()}
      </Text>
      <Text variant="h2" tone={tone === 'primary' ? 'primary' : tone}>
        {value}
      </Text>
      {hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/* ----------------------------- EmptyState ------------------------------ */

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, gap: 6 }}>
      <IconCircle size={60} bg={color.surfaceSunken}>
        {icon}
      </IconCircle>
      <Text variant="title" center style={{ marginTop: 6 }}>
        {title}
      </Text>
      <Text variant="bodySm" tone="muted" center>
        {message}
      </Text>
    </View>
  );
}

/* ------------------------------- ListRow ------------------------------- */

export function ListRow({
  left,
  title,
  subtitle,
  right,
  onPress,
}: {
  left?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const Inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
      {left}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="bodySm" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.6 }}>
        {Inner}
      </Pressable>
    );
  }
  return Inner;
}

/* -------------------------- SegmentedControl --------------------------- */

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: color.surfaceSunken,
        borderRadius: radius.full,
        padding: 4,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: radius.full,
              alignItems: 'center',
              backgroundColor: active ? color.surface : 'transparent',
            }}
          >
            <Text variant="bodySm" tone={active ? 'primary' : 'muted'}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
