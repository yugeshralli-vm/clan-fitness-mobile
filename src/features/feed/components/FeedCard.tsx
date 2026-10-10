import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { OnlineAvatar } from "@/components/shared/OnlineAvatar";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { Text } from "@/components/ui/Text";
import { CommentSheet } from "@/features/comments";
import { useOpenProfile } from "@/features/profile";
import { ReactionBar } from "@/features/reactions";
import type { FeedCard as FeedCardData } from "../types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * Port of a web FeedList card: avatar, then name + level badge + time; the day's thought as a
 * title; one line per check-in (icon + caption, food photos below); the reaction bar and the
 * comment pill, both live.
 */
export function FeedCard({ card, clanId }: { card: FeedCardData; clanId: string }) {
  const openProfile = useOpenProfile();
  const [reactions, setReactions] = useState(card.reactions ?? {});
  const [commentCount, setCommentCount] = useState(card.commentCount);
  // A feed refresh brings fresh counts — take them over whatever this card last set locally.
  useEffect(() => setReactions(card.reactions ?? {}), [card.reactions]);
  useEffect(() => setCommentCount(card.commentCount), [card.commentCount]);
  const thought = card.entries.find((entry) => entry.type === "thought");
  const others = card.entries.filter((entry) => entry.type !== "thought");
  return (
    <View className="flex-row items-start gap-3 rounded-lg border border-surfaceBorder bg-surface p-3">
      <Pressable onPress={() => openProfile(card.user.id)} className="shrink-0">
        <OnlineAvatar userId={card.user.id} name={card.user.name} avatarUrl={card.user.avatarUrl} />
      </Pressable>
      <View className="min-w-0 flex-1 gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 shrink flex-row items-center gap-1.5">
            <Pressable onPress={() => openProfile(card.user.id)} className="shrink">
              <Text className="text-sm font-semibold" numberOfLines={1}>
                {card.user.name}
              </Text>
            </Pressable>
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
          <ReactionBar checkInId={card.cardId} clanId={clanId} reactions={reactions} onChange={setReactions} />
          <CommentSheet checkInId={card.cardId} clanId={clanId} count={commentCount} onCountChange={setCommentCount} />
        </View>
      </View>
    </View>
  );
}
