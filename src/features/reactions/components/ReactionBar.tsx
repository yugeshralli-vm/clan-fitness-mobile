import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { colors } from "@/styles/tokens";
import { getReactions, toggleReaction } from "../services/reactions";
import { REACTION_EMOJIS, type ReactionCounts, type Reactor } from "../types";

const LONG_PRESS_MS = 450; // same as web

/**
 * Port of the web ReactionBar: 🔥 👏 👎 pills (accent border + count when you've reacted); tap to
 * toggle, long-press to see who reacted in a sheet.
 */
export function ReactionBar({
  checkInId,
  clanId,
  reactions,
  onChange,
}: {
  checkInId: string;
  clanId: string;
  reactions: ReactionCounts;
  onChange: (next: ReactionCounts) => void;
}) {
  const getToken = useApiToken();
  const [pending, setPending] = useState(false);
  const [detailEmoji, setDetailEmoji] = useState<string | null>(null);
  const [reactors, setReactors] = useState<Reactor[] | null>(null);

  async function handlePress(emoji: string) {
    if (pending) return;
    setPending(true);
    try {
      onChange((await toggleReaction(getToken, checkInId, clanId, emoji)).reactions);
    } catch {
      // Leave the pills as they were; the next feed refresh shows the real state.
    } finally {
      setPending(false);
    }
  }

  async function handleLongPress(emoji: string) {
    setDetailEmoji(emoji);
    setReactors(null);
    try {
      const { reactions: withNames } = await getReactions(getToken, checkInId, clanId);
      setReactors(withNames[emoji]?.users ?? []);
    } catch {
      setReactors([]);
    }
  }

  return (
    <>
      <View className="flex-row gap-1.5">
        {REACTION_EMOJIS.map((emoji) => {
          const entry = reactions[emoji];
          const count = entry?.count ?? 0;
          const mine = entry?.reactedByMe ?? false;
          return (
            <Pressable
              key={emoji}
              onPress={() => handlePress(emoji)}
              onLongPress={() => handleLongPress(emoji)}
              delayLongPress={LONG_PRESS_MS}
              disabled={pending}
              className={`min-h-9 flex-row items-center gap-1 rounded-full border px-3 py-1.5 ${mine ? "border-accent" : "border-surfaceBorder"} ${
                pending ? "opacity-60" : ""
              }`}
            >
              <Text className="text-xs">{emoji}</Text>
              {count > 0 && <Text className={`text-xs ${mine ? "text-accent" : "text-foregroundTertiary"}`}>{count}</Text>}
            </Pressable>
          );
        })}
      </View>

      <BottomSheet
        open={detailEmoji !== null}
        onClose={() => setDetailEmoji(null)}
        title={detailEmoji ? `Reacted ${detailEmoji}` : "Reactions"}
      >
        {reactors === null ? (
          <ActivityIndicator color={colors.accent} />
        ) : reactors.length === 0 ? (
          <Text className="text-sm text-foregroundTertiary">No one yet.</Text>
        ) : (
          <View>
            {reactors.map((user, i) => (
              <View
                key={user.id}
                className={`flex-row items-center gap-3 py-3 ${i > 0 ? "border-t border-surfaceBorder" : ""} ${i === 0 ? "pt-0" : ""}`}
              >
                <Avatar name={user.name} avatarUrl={user.avatarUrl} />
                <Text className="text-sm">{user.name}</Text>
              </View>
            ))}
          </View>
        )}
      </BottomSheet>
    </>
  );
}
