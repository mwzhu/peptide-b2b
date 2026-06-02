import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { color, font, radius } from '../../theme';
import { Text } from './Text';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  suffix?: string;
}

/** Labelled text input with a soft, focus-aware surface. */
export function TextField({ label, hint, suffix, multiline, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="bodySm" tone="secondary" style={{ fontFamily: font.bodySemibold }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: color.surface,
          borderRadius: radius.lg,
          borderWidth: 1.5,
          borderColor: focused ? color.primary : color.border,
          paddingHorizontal: 14,
          minHeight: multiline ? 96 : 50,
        }}
      >
        <TextInput
          {...rest}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={color.textMuted}
          style={{
            flex: 1,
            fontFamily: font.body,
            fontSize: 15,
            color: color.textPrimary,
            paddingVertical: multiline ? 12 : 0,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
        {suffix ? (
          <Text variant="bodySm" tone="muted">
            {suffix}
          </Text>
        ) : null}
      </View>
      {hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
