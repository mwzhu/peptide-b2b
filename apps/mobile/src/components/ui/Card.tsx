import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import { color, nativeShadow, radius } from '../../theme';
import { Text } from './Text';

interface CardProps extends ViewProps {
  children: ReactNode;
  /** Visual emphasis. `flat` removes the shadow; `tinted` uses a soft fill. */
  variant?: 'raised' | 'flat' | 'tinted';
  padded?: boolean;
  onPress?: () => void;
}

/** Soft, rounded surface — the building block of every screen. */
export function Card({
  children,
  variant = 'raised',
  padded = true,
  onPress,
  style,
  ...rest
}: CardProps) {
  const base = {
    backgroundColor: variant === 'tinted' ? color.surfaceSunken : color.surface,
    borderRadius: radius['2xl'],
    borderWidth: variant === 'flat' ? 1 : 0,
    borderColor: color.border,
    padding: padded ? 18 : 0,
    ...(variant === 'raised' ? nativeShadow.sm : null),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, pressed && { opacity: 0.85, transform: [{ scale: 0.992 }] }, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={[base, style]} {...rest}>
      {children}
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

/** Small label above a group of cards or list rows. */
export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="mb-2 mt-1 flex-row items-center justify-between px-1">
      <Text variant="overline" tone="muted">
        {title.toUpperCase()}
      </Text>
      {action}
    </View>
  );
}
