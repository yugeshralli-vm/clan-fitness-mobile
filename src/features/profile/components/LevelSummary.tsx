import { View } from "react-native";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { Text } from "@/components/ui/Text";
import type { ProfileResponse } from "../types";

/**
 * Port of the web ProfileLevelSummary: level badge, progress bar and points to the next level —
 * including today's completed-but-not-yet-resolved contracts, as the web counts them.
 */
export function LevelSummary({ progress }: { progress: NonNullable<ProfileResponse["levelProgress"]> }) {
  const { level, pointsIntoLevel, pointsForNextLevel } = progress;
  return (
    <View className="gap-2 rounded-lg border border-surfaceBorder bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <LevelBadge level={level} />
        <Text className="text-sm font-semibold">Level {level}</Text>
      </View>
      <View className="h-2 w-full overflow-hidden rounded-full bg-background">
        <View className="h-full rounded-full bg-accent" style={{ width: `${progress.progress * 100}%` }} />
      </View>
      <Text className="text-xs text-foregroundTertiary">
        {pointsIntoLevel} / {pointsForNextLevel} points to Level {level + 1}
      </Text>
    </View>
  );
}
