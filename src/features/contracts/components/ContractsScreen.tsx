import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useActiveClan } from "@/features/clans";
import { useRealtime } from "@/features/realtime";
import { useApiToken } from "@/hooks/useApiToken";
import { apiErrorMessage } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { colors } from "@/styles/tokens";
import { loadCelebrated, saveCelebrated } from "../celebrated";
import { claimContract, getContracts } from "../services/contracts";
import type { ContractBoardEntry, ContractTier, LiveClaimProgress } from "../types";
import { ContractCard, TierStars } from "./ContractCard";

/** The web board's poll rate — only used while the realtime socket isn't open. */
const FALLBACK_POLL_INTERVAL_MS = 5000;
const TIER_ORDER: ContractTier[] = [1, 2, 3];
const TIER_TITLE: Record<ContractTier, string> = { 1: "Noob", 2: "Veteran", 3: "Legend" };

/**
 * Port of the web contracts page (/clans/[clanId]/contracts): today's board by tier (Noob, Veteran,
 * Legend), two cards a row. Live while open — progress depends on check-ins, comments, reactions
 * and chat, not just claims. Your own completions get the web's "Contract complete" celebration
 * (as a toast), once per claim.
 */
export function ContractsScreen({ clanId }: { clanId: string }) {
  const getToken = useApiToken();
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const { clans } = useActiveClan();
  const clanName = clans.find((c) => c.id === clanId)?.name;
  const [board, setBoard] = useState<ContractBoardEntry[] | null>(null);
  const [maxClaims, setMaxClaims] = useState(1);
  const [liveCompletedIds, setLiveCompletedIds] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const celebratedRef = useRef<Set<string> | null>(null);

  const celebrate = useCallback(
    async (claimId: string, title: string, points: number) => {
      if (!userId) return;
      celebratedRef.current ??= await loadCelebrated(userId);
      if (celebratedRef.current.has(claimId)) return;
      celebratedRef.current.add(claimId);
      saveCelebrated(userId, celebratedRef.current);
      toast(`Contract complete — ${title} +${points}`);
    },
    [userId],
  );

  const applyProgress = useCallback(
    (progress: LiveClaimProgress[]) => {
      setLiveCompletedIds(new Set(progress.filter((p) => p.completed).map((p) => p.contractId)));
      for (const item of progress) if (item.completed && item.userId === userId) celebrate(item.claimId, item.title, item.points);
    },
    [userId, celebrate],
  );

  const refresh = useCallback(async () => {
    try {
      const data = await getContracts(getToken, clanId);
      setBoard(data.board);
      setMaxClaims(data.maxClaimsPerMemberPerDay);
      applyProgress(data.liveProgress);
      setError(null);
    } catch {
      setError("Couldn't load contracts.");
    }
  }, [clanId, getToken, applyProgress]);

  useEffect(() => {
    setBoard(null);
    refresh();
  }, [refresh]);

  useRealtime({
    events: ["contracts", "feed_post", "feed_engagement", "chat_message", "chat_reaction"],
    clanId,
    fallbackPollMs: FALLBACK_POLL_INTERVAL_MS,
    onChange: refresh,
  });

  async function handleClaim(contractId: string) {
    setPending(true);
    try {
      const result = await claimContract(getToken, clanId, contractId);
      setBoard(result.board);
      const opponentName = result.board.find((entry) => entry.contract.id === contractId)?.claim?.opponentName;
      if (opponentName) toast(`Duel matched! You vs ${opponentName}`);
      if (result.justCompleted) {
        setLiveCompletedIds((prev) => new Set(prev).add(contractId));
        celebrate(result.justCompleted.claimId, result.justCompleted.title, result.justCompleted.points);
      }
    } catch (err) {
      toast(apiErrorMessage(err, "Couldn't claim that contract."));
      refresh();
    } finally {
      setPending(false);
    }
  }

  const myClaimsToday = board?.filter((entry) => entry.claim?.userId === userId).length ?? 0;
  const atDailyCap = myClaimsToday >= maxClaims;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, gap: 24 }}>
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => router.navigate("/clan")} accessibilityLabel="Back to clan" className="-m-2 p-2">
          <ArrowLeft size={20} color={colors.foregroundSecondary} />
        </Pressable>
        <Text numberOfLines={1} className="shrink text-xl font-bold">
          {clanName ? `${clanName} contracts` : "Contracts"}
        </Text>
      </View>
      <Text className="text-sm text-foregroundTertiary">Claim a contract to earn points — each one can only be claimed by one member per day.</Text>

      {!board ? (
        error ? <Text className="text-sm text-danger">{error}</Text> : <ActivityIndicator color={colors.accent} />
      ) : (
        <View className="gap-6">
          {TIER_ORDER.map((tier) => {
            const entries = board.filter((entry) => entry.contract.tier === tier);
            if (entries.length === 0) return null;
            const rows = Array.from({ length: Math.ceil(entries.length / 2) }, (_, i) => entries.slice(i * 2, i * 2 + 2));
            return (
              <View key={tier} className="gap-3">
                <View className="flex-row items-center gap-1.5">
                  <TierStars tier={tier} size={14} />
                  <Text className="text-sm font-bold text-foregroundTertiary">{TIER_TITLE[tier]}</Text>
                </View>
                {rows.map((row, i) => (
                  <View key={i} className="flex-row gap-3">
                    {row.map((entry) => (
                      <ContractCard
                        key={entry.contract.id}
                        entry={entry}
                        pending={pending}
                        onClaim={handleClaim}
                        claimDisabled={atDailyCap}
                        liveCompleted={liveCompletedIds.has(entry.contract.id)}
                      />
                    ))}
                    {row.length === 1 && <View className="flex-1" />}
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
