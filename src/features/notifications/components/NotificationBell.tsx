import { Bell } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors } from "@/styles/tokens";
import { useUnreadNotificationCount } from "../hooks/useUnreadNotificationCount";

/**
 * The header bell with its red unread badge, matching the web NotificationBell's button. The
 * notification list itself comes with the notifications phase; until then this shows the count.
 */
export function NotificationBell() {
  const { count } = useUnreadNotificationCount();
  return (
    <Pressable accessibilityLabel="Notifications" className="relative min-h-11 min-w-11 items-center justify-center">
      <Bell size={22} strokeWidth={1.75} color={colors.foregroundTertiary} />
      {count > 0 && (
        <View className="absolute right-1 top-1 h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1">
          <Text className="text-[10px] font-semibold leading-none text-white">{count > 9 ? "9+" : count}</Text>
        </View>
      )}
    </Pressable>
  );
}
