import { Text as RNText, type TextProps } from 'react-native';
import { color, typeScale, type TypeVariant } from '../../theme';

const TONES = {
  primary: color.textPrimary,
  secondary: color.textSecondary,
  muted: color.textMuted,
  inverse: color.textInverse,
  brand: color.primary,
  accent: color.accent,
  danger: color.danger,
  success: color.success,
  warning: color.warning,
} as const;

export type TextTone = keyof typeof TONES;

interface Props extends TextProps {
  variant?: TypeVariant;
  tone?: TextTone;
  /** Override color directly (e.g. for tinted contexts). */
  textColor?: string;
  center?: boolean;
}

/** Typography primitive — resolves font family, size, and tone from tokens. */
export function Text({
  variant = 'body',
  tone = 'primary',
  textColor,
  center,
  style,
  ...rest
}: Props) {
  const spec = typeScale[variant];
  return (
    <RNText
      style={[
        {
          fontFamily: spec.fontFamily,
          fontSize: spec.fontSize,
          lineHeight: spec.lineHeight,
          letterSpacing: spec.letterSpacing ?? 0,
          color: textColor ?? TONES[tone],
        },
        center && { textAlign: 'center' },
        style,
      ]}
      {...rest}
    />
  );
}
