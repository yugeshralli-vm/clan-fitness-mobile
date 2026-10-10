import { useFocusEffect } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { OnlineAvatar } from "@/components/shared/OnlineAvatar";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { colors } from "@/styles/tokens";
import { getProfile } from "../services/profile";
import type { ProfileResponse } from "../types";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { HistorySection } from "./HistorySection";
import { LevelSummary } from "./LevelSummary";

/**
 * Port of the web profile pages — /profile for yourself (with the level summary) and
 * /members/[userId] for a clanmate: avatar, name and bio, this month's activity, and history.
 * `headerAction` sits at the right of the name row (the web's settings gear); `footer` below.
 */
export function ProfileView({ userId, headerAction, footer }: { userId: string; headerAction?: ReactNode; footer?: ReactNode }) {
  const getToken = useApiToken();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loadedAt, setLoadedAt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setProfile(await getProfile(getToken, userId));
      setLoadedAt(Date.now());
      setError(null);
    } catch {
      setError("Couldn't load this profile.");
    }
  }, [getToken, userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const current = profile?.user.id === userId ? profile : null;
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, gap: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
    >
      {!current ? (
        error ? <Text className="text-danger">{error}</Text> : <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          <View className="flex-row items-center gap-3">
            {current.isMe ? (
              <Avatar name={current.user.name} avatarUrl={current.user.avatarUrl} size={56} />
            ) : (
              <OnlineAvatar userId={current.user.id} name={current.user.name} avatarUrl={current.user.avatarUrl} size={56} />
            )}
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-xl font-bold">
                {current.user.name}
              </Text>
              {current.user.bio && (
                <Text numberOfLines={1} className="text-sm text-foregroundSecondary">
                  {current.user.bio}
                </Text>
              )}
            </View>
            {headerAction}
          </View>

          {current.levelProgress && <LevelSummary progress={current.levelProgress} />}
          <ActivityHeatmap days={current.heatmap} />
          {/* Re-seeded on every load, so a refresh shows new logs under the default filters. */}
          <HistorySection key={loadedAt} userId={current.user.id} timezone={current.user.timezone} initial={current.history} />
        </>
      )}
      {footer}
    </ScrollView>
  );
}
