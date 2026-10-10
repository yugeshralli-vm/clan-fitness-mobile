import {
  Activity,
  AtSign,
  Bell,
  Heart,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Reply,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { useRealtime } from "@/features/realtime";
import { useApiToken } from "@/hooks/useApiToken";
import { colors } from "@/styles/tokens";
import { formatRelativeTime } from "../format";
import { useOpenNotificationUrl } from "../hooks/useOpenNotificationUrl";
import { useUnreadNotificationCount } from "../hooks/useUnreadNotificationCount";
import { openNotifications, type NotificationItem, type NotificationType } from "../services/notifications";

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  comment: MessageCircle,
  mention: AtSign,
  reaction: Heart,
  check_in: Activity,
  missed_log: Bell,
  nudge: Zap,
  feedback: MessageSquare,
  broadcast: Megaphone,
  weekly_recap: Trophy,
  clan_message: MessageSquare,
  reply: Reply,
  contract: Star,
};

/**
 * Port of the web NotificationBell: the header bell with its red unread badge, opening a
 * "Notifications" sheet. Opening marks everything read; the ones that were unread keep a faint
 * accent background. Tapping one goes to the screen it's about.
 */
export function NotificationBell() {
  const getToken = useApiToken();
  const { count, refresh: refreshCount } = useUnreadNotificationCount();
  const openUrl = useOpenNotificationUrl();
  const [open, setOpen] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      setItems((await openNotifications(getToken)).notifications);
    } catch {
      setError(true);
      setItems((prev) => prev ?? []);
    } finally {
      setLoading(false);
    }
  }

  // While the sheet is open, new notifications appear in it (and stay read), like the web.
  useRealtime({
    events: ["notifications"],
    onChange: () => {
      if (open) load();
      else setCleared(false);
    },
  });

  function handleOpen() {
    setOpen(true);
    setCleared(true);
    setItems(null);
    load();
  }

  function handleClose() {
    setOpen(false);
    refreshCount();
  }

  function handleItemPress(item: NotificationItem) {
    handleClose();
    openUrl(item.url);
  }

  const display = cleared ? 0 : count;
  return (
    <>
      <Pressable onPress={handleOpen} accessibilityLabel="Notifications" className="relative min-h-11 min-w-11 items-center justify-center">
        <Bell size={22} strokeWidth={1.75} color={colors.foregroundTertiary} />
        {display > 0 && (
          <View className="absolute right-1 top-1 h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1">
            <Text className="text-[10px] font-semibold leading-none text-white">{display > 9 ? "9+" : display}</Text>
          </View>
        )}
      </Pressable>

      <BottomSheet open={open} onClose={handleClose} title="Notifications">
        {items === null ? (
          <Text className="py-6 text-center text-sm text-foregroundTertiary">{loading ? "Loading..." : ""}</Text>
        ) : items.length === 0 ? (
          <Text className="py-6 text-center text-sm text-foregroundTertiary">
            {error ? "Couldn't load notifications — try again." : "You're all caught up."}
          </Text>
        ) : (
          <View className="gap-1">
            {items.map((item) => {
              const Icon = TYPE_ICON[item.type] ?? Bell;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleItemPress(item)}
                  className={`flex-row items-start gap-3 rounded-lg px-3 py-2.5 ${item.readAt === null ? "bg-accent/5" : ""}`}
                >
                  <View className="mt-0.5 shrink-0">
                    <Icon size={18} color={colors.foregroundTertiary} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-medium">{item.title}</Text>
                    <Text numberOfLines={1} className="text-xs text-foregroundTertiary">
                      {item.body}
                    </Text>
                  </View>
                  <Text className="shrink-0 text-xs text-foregroundMuted">{formatRelativeTime(item.createdAt)}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </BottomSheet>
    </>
  );
}
