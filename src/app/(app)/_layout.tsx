import { Tabs } from "expo-router";
import { View } from "react-native";
import { AppHeader } from "@/components/shared/AppHeader";
import { BottomNav } from "@/components/shared/BottomNav";
import { ActiveClanProvider } from "@/features/clans";
import { StepSyncProvider } from "@/features/health";
import { colors } from "@/styles/tokens";

// Same shell as the web app's (app)/layout.tsx: header on top, tab content, BottomNav below —
// tab order Feed/Clan/Log/Chat/Profile, with Log as the raised center action.
export default function AppTabsLayout() {
  return (
    <ActiveClanProvider>
      <StepSyncProvider>
        <View className="flex-1 bg-background">
          <AppHeader />
          <Tabs
            tabBar={(props) => <BottomNav {...props} />}
            screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
          >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="clan" />
            <Tabs.Screen name="log" />
            <Tabs.Screen name="chat" />
            <Tabs.Screen name="profile" />
          </Tabs>
        </View>
      </StepSyncProvider>
    </ActiveClanProvider>
  );
}
