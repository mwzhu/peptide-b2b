import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CalendarCheck, House, MessageCircle, Syringe, User } from 'lucide-react-native';
import { color, nativeShadow, radius } from '../../src/theme';
import { Text } from '../../src/components/ui';

const TABS: Record<string, { label: string; Icon: typeof House }> = {
  index: { label: 'Today', Icon: House },
  plan: { label: 'Plan', Icon: CalendarCheck },
  log: { label: 'Log', Icon: Syringe },
  messages: { label: 'Messages', Icon: MessageCircle },
  profile: { label: 'Profile', Icon: User },
};

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: insets.bottom > 0 ? insets.bottom : 14,
        flexDirection: 'row',
        backgroundColor: color.surface,
        borderRadius: radius.full,
        paddingVertical: 9,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: color.border,
        ...nativeShadow.lg,
      }}
    >
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const { Icon } = tab;
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: radius.full,
                backgroundColor: focused ? color.primarySoft : 'transparent',
              }}
            >
              <Icon
                size={21}
                color={focused ? color.primary : color.textMuted}
                strokeWidth={focused ? 2.4 : 2}
              />
            </View>
            <Text variant="overline" tone={focused ? 'brand' : 'muted'}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="log" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
