import { Text, View } from "react-native";
import type { FeedCard as FeedCardData } from "../types";
import { Avatar } from "./Avatar";

type Props = {
  card: FeedCardData;
};

export function FeedCard({ card }: Props) {
  const thoughtEntry = card.entries.find((entry) => entry.type === "thought");
  const otherEntries = card.entries.filter((entry) => entry.type !== "thought");
  const time = new Date(card.latestAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <View className="mx-4 mb-3 gap-3 rounded-lg border border-surfaceBorder bg-surface p-4">
      <View className="flex-row items-center gap-3">
        <Avatar name={card.user.name} avatarUrl={card.user.avatarUrl} />
        <View className="flex-1">
          <Text className="font-semibold text-foreground">{card.user.name}</Text>
          <Text className="text-xs text-foregroundTertiary">{time}</Text>
        </View>
      </View>

      {thoughtEntry && <Text className="text-base text-foreground">"{thoughtEntry.caption}"</Text>}

      {otherEntries.length > 0 && (
        <View className="gap-1.5">
          {otherEntries.map((entry) => (
            <Text key={entry.id} className="text-sm text-foregroundSecondary">
              {entry.icon} {entry.caption}
            </Text>
          ))}
        </View>
      )}

      <View className="flex-row gap-4 pt-1">
        <Text className="text-xs text-foregroundTertiary">🔥 {card.reactionCount}</Text>
        <Text className="text-xs text-foregroundTertiary">💬 {card.commentCount}</Text>
      </View>
    </View>
  );
}
