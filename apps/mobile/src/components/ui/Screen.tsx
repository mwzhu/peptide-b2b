import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { color } from '../../theme';
import { Text } from './Text';

/** In-content header — back affordance, title block, optional right slot. */
export function Header({
  title,
  subtitle,
  onBack,
  showBack,
  right,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 44,
        marginBottom: 8,
      }}
    >
      {showBack ? (
        <Pressable
          onPress={() => (onBack ? onBack() : router.back())}
          hitSlop={10}
          style={({ pressed }) => [
            {
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: color.surface,
              borderWidth: 1,
              borderColor: color.border,
              alignItems: 'center',
              justifyContent: 'center',
            },
            pressed && { opacity: 0.6 },
          ]}
        >
          <ChevronLeft size={22} color={color.textPrimary} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        {subtitle ? (
          <Text variant="overline" tone="muted">
            {subtitle.toUpperCase()}
          </Text>
        ) : null}
        {title ? <Text variant="h2">{title}</Text> : null}
      </View>
      {right}
    </View>
  );
}

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Sticky element rendered above the scroll area (e.g. a Header). */
  header?: ReactNode;
  /** Element pinned to the bottom (e.g. a primary action). */
  footer?: ReactNode;
  padded?: boolean;
  /** Adds clearance for the floating tab bar on tab screens. */
  tabBar?: boolean;
}

/** Page scaffold — safe-area aware, warm canvas, optional sticky header/footer. */
export function Screen({
  children,
  scroll = true,
  header,
  footer,
  padded = true,
  tabBar,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const pad = padded ? 20 : 0;
  const tabClearance = tabBar ? 96 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top }}>
      {header ? <View style={{ paddingHorizontal: pad, paddingTop: 6 }}>{header}</View> : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: pad,
            paddingTop: header ? 4 : 6,
            paddingBottom: insets.bottom + (footer ? 16 : 28) + tabClearance,
            gap: 14,
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: pad, paddingTop: 6 }}>{children}</View>
      )}
      {footer ? (
        <View
          style={{
            paddingHorizontal: pad,
            paddingTop: 12,
            paddingBottom: insets.bottom + 12,
            backgroundColor: color.canvas,
            borderTopWidth: 1,
            borderTopColor: color.border,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
