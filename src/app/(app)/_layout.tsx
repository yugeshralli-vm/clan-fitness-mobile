import { colors } from "@/styles/tokens";
import { Activity, MessageSquare, Plus, Shield, User } from "lucide-react-native";
import { Tabs } from "expo-router";

// Mirrors clan-fitness's web BottomNav.tsx tab order/icons exactly (Feed/Clan/Log/Chat/Profile,
// Log emphasized as the center action) — same icon choices, ported from lucide-react to
// lucide-react-native.
export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.foregroundTertiary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.surfaceBorder },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Feed", tabBarIcon: ({ color, size }) => <Activity color={color} size={size} /> }} />
      <Tabs.Screen name="clan" options={{ title: "Clan", tabBarIcon: ({ color, size }) => <Shield color={color} size={size} /> }} />
      <Tabs.Screen name="log" options={{ title: "Log", tabBarIcon: ({ color, size }) => <Plus color={color} size={size} /> }} />
      <Tabs.Screen name="chat" options={{ title: "Chat", tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
