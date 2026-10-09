import type { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Activity, MessageSquare, Plus, Shield, User, type LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { colors } from "@/styles/tokens";

// expo-router bundles React Navigation internally, so the tab bar's props type is read off Tabs.
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const ITEMS: Record<string, { label: string; icon: LucideIcon; emphasize?: boolean }> = {
  index: { label: "Feed", icon: Activity },
  clan: { label: "Clan", icon: Shield },
  log: { label: "Log", icon: Plus, emphasize: true },
  chat: { label: "Chat", icon: MessageSquare },
  profile: { label: "Profile", icon: User },
};

/**
 * Port of the web BottomNav: five equal items on surface with a top border; the active one in
 * accent with a heavier icon stroke, and Log as a raised 56px accent circle sitting above the bar.
 */
export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-row border-t border-surfaceBorder bg-surface" style={{ paddingBottom: insets.bottom }}>
      {state.routes.map((route, index) => {
        const item = ITEMS[route.name];
        if (!item) return null;
        const active = state.index === index;
        const Icon = item.icon;
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!active && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={route.key} onPress={onPress} className="min-h-11 flex-1 items-center justify-center gap-0.5 py-2">
            {item.emphasize ? (
              <View className="-mt-6 h-14 w-14 items-center justify-center gap-0.5 rounded-full bg-accent">
                <Icon size={20} strokeWidth={2.5} color={colors.accentForeground} />
                <Text className="text-[10px] font-bold text-accentForeground">{item.label}</Text>
              </View>
            ) : (
              <>
                <Icon size={22} strokeWidth={active ? 2.25 : 1.75} color={active ? colors.accent : colors.foregroundTertiary} />
                <Text className={`text-xs font-semibold ${active ? "text-accent" : "text-foregroundTertiary"}`}>{item.label}</Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
