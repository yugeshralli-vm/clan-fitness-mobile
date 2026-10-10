import { Reply } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, PanResponder, Pressable, View, useWindowDimensions } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { OnlineAvatar } from "@/components/shared/OnlineAvatar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { mentionsToPlainText, parseCommentSegments } from "@/lib/mentions";
import { colors } from "@/styles/tokens";
import { CHAT_REACTION_EMOJIS, type ClanMessage } from "../types";

const SWIPE_TRIGGER_PX = 56;
const SWIPE_MAX_PX = 72;
const LONG_PRESS_MS = 450; // same as web
const TRAY_HEIGHT = 48;

type TrayPosition = { top: number; left?: number; right?: number };

/**
 * Port of the web ClanChatMessageRow: swipe right to reply, hold to react (an 8-emoji tray above the
 * bubble), tap a bubble or its reaction pills to see who reacted — and remove your own from there.
 * Others' messages get an avatar with the online dot plus name and level; yours sit right in accent.
 */
export function ChatMessageRow({
  message,
  mine,
  currentUserId,
  pending,
  onReply,
  onReact,
}: {
  message: ClanMessage;
  mine: boolean;
  currentUserId: string | undefined;
  pending: boolean;
  onReply: (message: ClanMessage) => void;
  onReact: (message: ClanMessage, emoji: string) => void;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const bubbleRef = useRef<View>(null);
  const [tray, setTray] = useState<TrayPosition | null>(null);
  const [reactorSheetOpen, setReactorSheetOpen] = useState(false);

  // Swipe right to reply. Only a mostly-horizontal drag claims the touch, so vertical scrolling
  // through the chat is unaffected (the web's dragDirectionLock).
  const x = useRef(new Animated.Value(0)).current;
  const onReplyRef = useRef(onReply);
  const messageRef = useRef(message);
  useEffect(() => {
    onReplyRef.current = onReply;
    messageRef.current = message;
  });
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_e, g) => g.dx > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_e, g) => x.setValue(Math.max(0, Math.min(SWIPE_MAX_PX, g.dx * 0.7))),
      onPanResponderRelease: (_e, g) => {
        if (g.dx * 0.7 > SWIPE_TRIGGER_PX) onReplyRef.current(messageRef.current);
        Animated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
      },
      onPanResponderTerminate: () => Animated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start(),
    }),
  ).current;
  const replyIconOpacity = x.interpolate({ inputRange: [0, SWIPE_TRIGGER_PX], outputRange: [0, 1], extrapolate: "clamp" });

  const presentEmojis = Object.entries(message.reactionsSummary).filter(([, entry]) => entry.users.length > 0);
  // Removing your own last reaction from the sheet can empty it; never leave an empty sheet open.
  const showReactorSheet = reactorSheetOpen && presentEmojis.length > 0;
  const optimistic = message.id.startsWith("optimistic-");

  function openTray() {
    if (optimistic) return;
    bubbleRef.current?.measureInWindow((bx, by, bw, bh) => {
      const top = by > TRAY_HEIGHT + 64 ? by - TRAY_HEIGHT - 4 : by + bh + 4;
      setTray(mine ? { top, right: Math.max(8, windowWidth - (bx + bw)) } : { top, left: Math.max(8, bx) });
    });
  }

  function react(emoji: string) {
    setTray(null);
    onReact(message, emoji);
  }

  function openReactorSheet() {
    if (presentEmojis.length > 0) setReactorSheetOpen(true);
  }

  return (
    <View className="relative min-w-0">
      <Animated.View pointerEvents="none" style={{ opacity: replyIconOpacity }} className="absolute bottom-0 left-0 top-0 justify-center">
        <Reply size={18} color={colors.foregroundTertiary} />
      </Animated.View>
      <Animated.View
        {...pan.panHandlers}
        style={{ transform: [{ translateX: x }] }}
        className={`items-end gap-2 bg-background ${mine ? "flex-row-reverse" : "flex-row"}`}
      >
        {!mine && <OnlineAvatar userId={message.userId} name={message.authorName} avatarUrl={message.authorAvatarUrl} size={28} />}
        <View className={`min-w-0 max-w-[75%] gap-0.5 ${mine ? "items-end" : "items-start"}`}>
          {!mine && (
            <View className="flex-row items-center gap-1 px-1">
              <Text numberOfLines={1} className="shrink text-xs font-semibold text-foregroundTertiary">
                {message.authorName}
              </Text>
              <LevelBadge level={message.authorLevel} />
            </View>
          )}
          <Pressable
            ref={bubbleRef}
            onPress={openReactorSheet}
            onLongPress={openTray}
            delayLongPress={LONG_PRESS_MS}
            className={`min-w-0 rounded-lg px-3 py-2 ${mine ? "bg-accent" : "border border-surfaceBorder bg-surface"} ${optimistic ? "opacity-70" : ""}`}
          >
            {message.replyToMessageId && (
              <View className={`mb-1 rounded-md border-l-2 px-2 py-1 ${mine ? "border-accentForeground/40 bg-black/10" : "border-accent/60 bg-white/5"}`}>
                <Text numberOfLines={1} className={`text-xs font-semibold ${mine ? "text-accentForeground" : "text-foregroundSecondary"}`}>
                  {message.replyToAuthorName ?? "Original message"}
                </Text>
                <Text numberOfLines={2} className={`text-xs opacity-80 ${mine ? "text-accentForeground" : "text-foregroundSecondary"}`}>
                  {mentionsToPlainText(message.replyToBody ?? "")}
                </Text>
              </View>
            )}
            <Text className={`text-sm ${mine ? "text-accentForeground" : "text-foregroundSecondary"}`}>
              {parseCommentSegments(message.body).map((segment, i) =>
                segment.type === "mention" ? (
                  <Text key={i} className={`text-sm font-semibold ${mine ? "text-accentForeground" : "text-accent"}`}>
                    @{segment.name}
                  </Text>
                ) : (
                  <Text key={i} className={`text-sm ${mine ? "text-accentForeground" : "text-foregroundSecondary"}`}>
                    {segment.value}
                  </Text>
                ),
              )}
            </Text>
          </Pressable>

          {presentEmojis.length > 0 && (
            <View className="flex-row flex-wrap gap-1">
              {presentEmojis.map(([emoji, entry]) => (
                <Pressable
                  key={emoji}
                  onPress={openReactorSheet}
                  className={`flex-row items-center gap-1 rounded-full border px-2 py-0.5 ${entry.reactedByMe ? "border-accent" : "border-surfaceBorder"}`}
                >
                  <Text className="text-xs">{emoji}</Text>
                  <Text className={`text-xs ${entry.reactedByMe ? "text-accent" : "text-foregroundTertiary"}`}>{entry.users.length}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Animated.View>

      <Modal visible={tray !== null} transparent animationType="fade" onRequestClose={() => setTray(null)} statusBarTranslucent navigationBarTranslucent>
        <Pressable className="absolute inset-0" onPress={() => setTray(null)} accessibilityLabel="Close" />
        {tray && (
          <View
            className="absolute max-w-[90%] flex-row flex-wrap gap-1 rounded-full border border-surfaceBorder bg-surface p-1.5"
            style={{ top: tray.top, left: tray.left, right: tray.right, elevation: 8 }}
          >
            {CHAT_REACTION_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => react(emoji)}
                disabled={pending}
                accessibilityLabel={`React ${emoji}`}
                className={`h-9 w-9 items-center justify-center rounded-full ${pending ? "opacity-60" : ""}`}
              >
                <Text className="text-lg">{emoji}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </Modal>

      <BottomSheet open={showReactorSheet} onClose={() => setReactorSheetOpen(false)} title="Reactions">
        <View className="gap-4">
          {presentEmojis.map(([emoji, entry]) => (
            <View key={emoji}>
              <Text className="mb-2 text-xs font-semibold text-foregroundTertiary">
                {emoji} {entry.users.length}
              </Text>
              {entry.users.map((user, i) => {
                const row = `flex-row items-center gap-3 py-3 ${i > 0 ? "border-t border-surfaceBorder" : "pt-0"} ${
                  i === entry.users.length - 1 ? "pb-0" : ""
                }`;
                return user.id === currentUserId ? (
                  <Pressable key={user.id} onPress={() => onReact(message, emoji)} disabled={pending} className={`${row} ${pending ? "opacity-60" : ""}`}>
                    <Avatar name={user.name} avatarUrl={user.avatarUrl} />
                    <View>
                      <Text className="text-sm">You</Text>
                      <Text className="text-xs text-foregroundTertiary">Tap to remove</Text>
                    </View>
                  </Pressable>
                ) : (
                  <View key={user.id} className={row}>
                    <Avatar name={user.name} avatarUrl={user.avatarUrl} />
                    <Text className="text-sm">{user.name}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}
