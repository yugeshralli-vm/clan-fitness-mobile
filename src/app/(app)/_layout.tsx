import { Tabs, usePathname, useRouter } from "expo-router";
import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import { AppHeader } from "@/components/shared/AppHeader";
import { BottomNav } from "@/components/shared/BottomNav";
import { ActiveClanProvider, useActiveClan } from "@/features/clans";
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
          <View
            className="flex-1 bg-background"
            style={{ paddingBottom: keyboardHeight }}
          >
            <OnboardingGate header={<AppHeader />}>
              <Tabs
                tabBar={(props) =>
                  props.state.routes[props.state.index]?.name ===
                  "onboarding" ? null : (
                    <BottomNav {...props} />
                  )
                }
                // Back from a member's profile returns to wherever it was opened from.
                backBehavior="history"
                screenOptions={{
                  headerShown: false,
                  sceneStyle: { backgroundColor: colors.background },
                }}
              >
                <Tabs.Screen name="index" />
                <Tabs.Screen name="clan" />
                <Tabs.Screen name="log" />
                <Tabs.Screen name="chat" />
                <Tabs.Screen name="profile" />
                {/* Not tabs (BottomNav only draws the five above): pages opened from them. */}
                <Tabs.Screen name="members/[userId]" options={{ href: null }} />
                <Tabs.Screen name="clans/new" options={{ href: null }} />
                <Tabs.Screen name="clans/join" options={{ href: null }} />
                <Tabs.Screen name="clans/[clanId]/welcome" options={{ href: null }} />
                <Tabs.Screen name="clans/[clanId]/contracts" options={{ href: null }} />
                <Tabs.Screen name="onboarding" options={{ href: null }} />
              </Tabs>
            </OnboardingGate>
          </View>
        </HealthStepsProvider>
      </ActiveClanProvider>
    </RealtimeProvider>
  );
}

/**
 * Someone in no clan goes to onboarding, like the web layout's redirect to /onboarding — a full
 * screen without the header or nav. Creating or joining from there navigates on by itself.
 */
function OnboardingGate({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  const { clans, loading, error } = useActiveClan();
  const pathname = usePathname();
  const router = useRouter();
  const onOnboarding = pathname === "/onboarding";
  const noClans = !loading && !error && clans.length === 0;

  useEffect(() => {
    if (noClans && !onOnboarding) router.replace("/onboarding");
  }, [noClans, onOnboarding, router]);

  return (
    <>
      {!onOnboarding && header}
      {children}
    </>
  );
}
