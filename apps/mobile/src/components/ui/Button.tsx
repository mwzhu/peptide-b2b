import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { color, radius } from '../../theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const SURFACE: Record<Variant, { bg: string; border?: string }> = {
  primary: { bg: color.primary },
  secondary: { bg: color.surface, border: color.borderStrong },
  ghost: { bg: 'transparent' },
  danger: { bg: color.dangerSoft },
};

const LABEL_TONE: Record<Variant, string> = {
  primary: color.onPrimary,
  secondary: color.textPrimary,
  ghost: color.primary,
  danger: color.danger,
};

const HEIGHT: Record<Size, number> = { sm: 38, md: 48, lg: 56 };

/** Primary action control with haptics and a soft press animation. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  disabled,
  loading,
}: Props) {
  const surface = SURFACE[variant];
  const inert = disabled || loading;

  return (
    <Pressable
      disabled={inert}
      onPress={() => {
        if (inert) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          height: HEIGHT[size],
          backgroundColor: surface.bg,
          borderRadius: radius.full,
          borderWidth: surface.border ? 1.5 : 0,
          borderColor: surface.border,
          paddingHorizontal: size === 'sm' ? 16 : 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: inert ? 0.5 : 1,
        },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={LABEL_TONE[variant]} />
      ) : (
        <>
          {icon}
          <Text variant={size === 'sm' ? 'bodySm' : 'title'} textColor={LABEL_TONE[variant]}>
            {label}
          </Text>
          {iconRight}
        </>
      )}
    </Pressable>
  );
}

/** Circular icon-only button. */
export function IconButton({
  children,
  onPress,
  tone = 'surface',
}: {
  children: ReactNode;
  onPress?: () => void;
  tone?: 'surface' | 'tinted';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: 42,
          height: 42,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tone === 'tinted' ? color.primarySoft : color.surface,
          borderWidth: tone === 'surface' ? 1 : 0,
          borderColor: color.border,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View>{children}</View>
    </Pressable>
  );
}
