import { MessageCircle } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { Text } from "@/components/ui/Text";
import { colors } from "@/styles/tokens";
import type { FeedCard as FeedCardData } from "../types";

// Same order as the web REACTION_EMOJIS.
const REACTION_EMOJIS = ["🔥", "👏", "👎"] as const;

const PILL = "min-h-9 flex-row items-center gap-1 rounded-full border px-3 py-1.5";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * Port of a web FeedList card: avatar, then name + level badge + time; the day's thought as a
 * title; one line per check-in (icon + caption, food photos below); reaction pills and a comment
 * pill. Reacting and commenting arrive with the social phase — the pills show live counts now.
 */
export function FeedCard({ card }: { card: FeedCardData }) {
  const thought = card.entries.find((entry) => entry.type === "thought");
  const others = card.entries.filter((entry) => entry.type !== "thought");
  return (
    <View className="flex-row items-start gap-3 rounded-lg border border-surfaceBorder bg-surface p-3">
      <Avatar name={card.user.name} avatarUrl={card.user.avatarUrl} />
      <View className="min-w-0 flex-1 gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 shrink flex-row items-center gap-1.5">
            <Text className="shrink text-sm font-semibold" numberOfLines={1}>
              {card.user.name}
            </Text>
            <LevelBadge level={card.user.level} />
          </View>
          <Text className="shrink-0 text-xs text-foregroundMuted">{formatTime(card.latestAt)}</Text>
        </View>

        {thought && <Text className="text-base font-semibold">{(thought.value as { text: string }).text}</Text>}

        <View className="gap-1">
          {others.map((entry) => (
            <View key={entry.id} className="gap-2">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm text-foregroundSecondary">{entry.icon}</Text>
                <Text className="shrink text-sm text-foregroundSecondary">{entry.caption}</Text>
              </View>
              <PhotoCarousel photos={entry.photoUrls ?? []} />
            </View>
          ))}
        </View>

        <View className="flex-row items-center gap-2">
          <View className="flex-row gap-1.5">
            {REACTION_EMOJIS.map((emoji) => {
              const entry = card.reactions?.[emoji];
              const count = entry?.count ?? 0;
              return (
                <Pressable key={emoji} className={`${PILL} ${entry?.reactedByMe ? "border-accent" : "border-surfaceBorder"}`}>
                  <Text className="text-xs">{emoji}</Text>
                  {count > 0 && (
                    <Text className={`text-xs ${entry?.reactedByMe ? "text-accent" : "text-foregroundTertiary"}`}>{count}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
          <Pressable
            className={`${PILL} gap-1.5 border-surfaceBorder`}
            accessibilityLabel={card.commentCount > 0 ? `${card.commentCount} comments` : "Add a comment"}
          >
            <MessageCircle size={16} color={colors.foregroundTertiary} />
            {card.commentCount > 0 && <Text className="text-xs text-foregroundTertiary">{card.commentCount}</Text>}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
