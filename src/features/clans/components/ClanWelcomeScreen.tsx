import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { GoalsForm, getProfile } from "@/features/profile";
import { useApiToken } from "@/hooks/useApiToken";
import { colors } from "@/styles/tokens";
import { getClanDetail } from "../services/clans";
import type { ClanDetail } from "../types";
import { ShareInviteButton } from "./ShareInviteButton";

/**
 * Port of the web welcome page (/clans/[clanId]/welcome), shown right after creating or joining:
 * the admin's invite card, then goals to set (if you have none yet) or "Continue to the feed".
 */
export function ClanWelcomeScreen({ clanId }: { clanId: string }) {
  const getToken = useApiToken();
  const router = useRouter();
  const { user } = useUser();
  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [hasGoals, setHasGoals] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    getClanDetail(getToken, clanId).then(setClan).catch(() => {});
    getProfile(getToken, user.id)
      .then((profile) => setHasGoals(profile.goals?.gymDaysPerWeek != null || profile.goals?.stepsPerDay != null))
      .catch(() => setHasGoals(true));
  }, [clanId, getToken, user]);

  const toFeed = () => router.navigate("/");

  if (!clan || hasGoals === null) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 48, gap: 32 }} keyboardShouldPersistTaps="handled">
      <View>
        <Text className="text-3xl font-bold">Welcome to {clan.clan.name}! 🎉</Text>
        <Text className="text-foregroundSecondary">
          You&apos;re in. Log your first gym session, steps, or a meal photo — your clan&apos;s about to see it in the feed.
        </Text>
      </View>

      {clan.role === "admin" && clan.clan.inviteCode && (
        <View className="gap-3 rounded-xl border border-surfaceBorder bg-surface p-5">
          <View>
            <Text className="font-semibold">Invite your clan</Text>
            <Text className="text-sm text-foregroundTertiary">Share this link so your friends can join {clan.clan.name}.</Text>
          </View>
          <View className="self-start">
            <ShareInviteButton inviteCode={clan.clan.inviteCode} clanName={clan.clan.name} />
          </View>
        </View>
      )}

      {hasGoals ? (
        <Pressable onPress={toFeed} className="self-start">
          <Text className="font-semibold text-accent">Continue to the feed →</Text>
        </Pressable>
      ) : (
        <View className="gap-3 rounded-xl border border-surfaceBorder bg-surface p-5">
          <View>
            <Text className="font-semibold">Set your targets</Text>
            <Text className="text-sm text-foregroundTertiary">
              This is what your clan&apos;s leaderboard scores against — you can change it anytime in your profile.
            </Text>
          </View>
          <View className="gap-3">
            <GoalsForm onSuccess={toFeed} />
            <Pressable onPress={toFeed} className="min-h-9 items-center justify-center">
              <Text className="text-sm text-foregroundTertiary">Skip for now</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
