import { Tabs } from "expo-router";
import { View } from "react-native";
import { AppHeader } from "@/components/shared/AppHeader";
import { BottomNav } from "@/components/shared/BottomNav";
import { ActiveClanProvider } from "@/features/clans";
import { HealthStepsProvider } from "@/features/health";
import { RealtimeProvider } from "@/features/realtime";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { colors } from "@/styles/tokens";

// Same shell as the web app's (app)/layout.tsx: header on top, tab content, BottomNav below —
// tab order Feed/Clan/Log/Chat/Profile, with Log as the raised center action. While the keyboard
// is open the whole shell sits above it, nav included — what the browser's viewport resize does
// for the PWA (Android's edge-to-edge mode no longer resizes the window for us).
export default function AppTabsLayout() {
  const keyboardHeight = useKeyboardHeight();
  return (
    <RealtimeProvider>
      <ActiveClanProvider>
        <HealthStepsProvider>
          <View className="flex-1 bg-background" style={{ paddingBottom: keyboardHeight }}>
            <AppHeader />
            <Tabs
              tabBar={(props) => <BottomNav {...props} />}
              // Back from a member's profile returns to wherever it was opened from.
              backBehavior="history"
              screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
            >
              <Tabs.Screen name="index" />
              <Tabs.Screen name="clan" />
              <Tabs.Screen name="log" />
              <Tabs.Screen name="chat" />
              <Tabs.Screen name="profile" />
              {/* Not a tab (BottomNav only draws the five above): a clanmate's profile. */}
              <Tabs.Screen name="members/[userId]" options={{ href: null }} />
            </Tabs>
          </View>
        </HealthStepsProvider>
      </ActiveClanProvider>
    </RealtimeProvider>
  );
}
