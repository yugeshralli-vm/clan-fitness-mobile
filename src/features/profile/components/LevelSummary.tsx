import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { View } from "react-native";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { celebrate } from "@/components/ui/RewardSnackbar";
import { Text } from "@/components/ui/Text";
import type { ProfileResponse } from "../types";

const levelSeenKey = (userId: string) => `profile-level-seen_${userId}`;

/**
 * Port of the web ProfileLevelSummary: level badge, progress bar and points to the next level —
 * including today's completed-but-not-yet-resolved contracts, as the web counts them. Celebrates
 * the first time it shows a higher level than this phone last saw. Unlike the web, the very first
 * sighting only records the level, so installing the app doesn't announce a level-up you already had.
 */
export function LevelSummary({ userId, progress }: { userId: string; progress: NonNullable<ProfileResponse["levelProgress"]> }) {
  const { level, pointsIntoLevel, pointsForNextLevel } = progress;

  useEffect(() => {
    const key = levelSeenKey(userId);
    SecureStore.getItemAsync(key)
      .then((stored) => {
        const seen = stored === null ? null : Number(stored);
        if (seen !== null && level > seen) celebrate.levelUp(level);
        // Only ever moves up — a level can dip back within the day (see the web's comment).
        SecureStore.setItemAsync(key, String(Math.max(level, seen ?? 0))).catch(() => {});
      })
      .catch(() => {});
  }, [userId, level]);

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
