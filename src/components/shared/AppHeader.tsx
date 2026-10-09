import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { ClanSwitcher } from "@/features/clans";
import { NotificationBell } from "@/features/notifications";
import { LOGO_SVG } from "./logo-svg";

/**
 * Port of the web app shell's header ((app)/layout.tsx): 64px bar on surface with a bottom
 * border — logo on the left; clan switcher, notification bell and the user's avatar on the right.
 */
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  return (
    <View className="border-b border-surfaceBorder bg-surface" style={{ paddingTop: insets.top }}>
      <View className="h-16 flex-row items-center justify-between gap-3 px-4">
        <Pressable onPress={() => router.navigate("/log")} accessibilityLabel="Clan Fitness">
          <SvgXml xml={LOGO_SVG} height={28} width={112} />
        </Pressable>
        <View className="min-w-0 flex-1 flex-row items-center justify-end gap-3">
          <ClanSwitcher />
          <NotificationBell />
          <Pressable onPress={() => router.navigate("/profile")} accessibilityLabel="Profile">
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={{ width: 28, height: 28, borderRadius: 14 }} />
            ) : (
              <View className="h-7 w-7 rounded-full bg-background" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
