import { useUser } from "@clerk/expo";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { Tabs } from "@/components/ui/Tabs";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { colors } from "@/styles/tokens";
import { useActiveClan } from "../ActiveClanProvider";
import { getClanDetail } from "../services/clans";
import type { ClanDetail } from "../types";
import { ClanLeaderboardSection } from "./ClanLeaderboardSection";
import { ClanMembersSection } from "./ClanMembersSection";
import { ClanSettingsSheet } from "./ClanSettingsSheet";

/**
 * Port of the web clan page (/clans/[clanId]/manage) as the Clan tab: name and member count, the
 * admin's settings gear, then Leaderboard and Members tabs. Refreshes whenever the tab is opened,
 * and on pull-down.
 */
export function ClanScreen() {
  const getToken = useApiToken();
  const router = useRouter();
  const { user } = useUser();
  const { activeClan, loading: clanLoading, refresh: refreshClans } = useActiveClan();
  const clanId = activeClan?.id;
  const [detail, setDetail] = useState<ClanDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!clanId) return;
    try {
      const fetched = await getClanDetail(getToken, clanId);
      setDetail(fetched);
      setError(null);
    } catch {
      setError("Couldn't load the clan.");
    }
  }, [clanId, getToken]);

  useEffect(() => {
    setDetail(null);
  }, [clanId]);

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

  // Renames/admin changes show in the header and switcher too, so the clan list reloads as well.
  function handleChanged() {
    load();
    refreshClans();
  }

  // Left or deleted: the clan is gone from your list — back to the feed of your next clan, as the
  // web redirects to /logs.
  function handleGone() {
    refreshClans();
    router.navigate("/");
  }

  if (clanLoading && !activeClan) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (!activeClan) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-foregroundTertiary">Join a clan to see it here.</Text>
      </View>
    );
  }

  const current = detail?.clan.id === clanId ? detail : null;
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, gap: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-2xl font-bold">
            {current?.clan.name ?? activeClan.name}
          </Text>
          <Text className="text-sm text-foregroundTertiary">
            {current?.clan.memberCount ?? activeClan.memberCount}/{current?.clan.maxSize ?? activeClan.maxSize} members
          </Text>
        </View>
        {current?.role === "admin" && current.clan.inviteCode && (
          <View className="shrink-0">
            <ClanSettingsSheet
              key={current.clan.name}
              clanId={current.clan.id}
              clanName={current.clan.name}
              inviteCode={current.clan.inviteCode}
              memberCount={current.clan.memberCount}
              onChanged={handleChanged}
              onDeleted={handleGone}
            />
          </View>
        )}
      </View>

      {error && <Text className="text-sm text-danger">{error}</Text>}

      {!current ? (
        !error && <ActivityIndicator color={colors.accent} />
      ) : (
        <Tabs
          tabs={[
            { id: "leaderboard", label: "Leaderboard", content: <ClanLeaderboardSection leaderboards={current.leaderboards} /> },
            {
              id: "members",
              label: "Members",
              content: (
                <ClanMembersSection
                  clanId={current.clan.id}
                  detail={current}
                  currentUserId={user?.id}
                  onChanged={handleChanged}
                  onLeft={handleGone}
                />
              ),
            },
          ]}
        />
      )}
    </ScrollView>
  );
}
