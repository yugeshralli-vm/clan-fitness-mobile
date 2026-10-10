import { Image } from "expo-image";
import { Check, Star } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { Text } from "@/components/ui/Text";
import { colors } from "@/styles/tokens";
import type { ContractBoardEntry, ContractTier } from "../types";

const TIER_BORDER: Record<ContractTier, string> = { 1: "border-surfaceBorder", 2: "border-accent/60", 3: "border-amber-400/60" };
const TIER_STAR_COLOR: Record<ContractTier, string> = { 1: colors.foregroundTertiary, 2: colors.accent, 3: "#fbbf24" };

// The web serves each contract's artwork from /public/contracts; not every contract has one yet.
const WEB_ORIGIN = process.env.EXPO_PUBLIC_API_BASE_URL;
const compactSteps = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });

export function TierStars({ tier, size = 10 }: { tier: ContractTier; size?: number }) {
  return (
    <View className="flex-row items-center gap-0.5">
      {Array.from({ length: tier }, (_, i) => (
        <Star key={i} size={size} color={TIER_STAR_COLOR[tier]} fill={TIER_STAR_COLOR[tier]} strokeWidth={0} />
      ))}
    </View>
  );
}

/** Live "who's ahead" bar for a duel claim — refreshes with the board on every check-in. */
function DuelScoreboard({ steps }: { steps: { claimant: number; opponent: number } }) {
  const total = steps.claimant + steps.opponent;
  const claimantShare = total > 0 ? (steps.claimant / total) * 100 : 50;
  return (
    <View className="gap-1">
      <View className="flex-row justify-between gap-2">
        <Text className={`text-[11px] ${steps.claimant > steps.opponent ? "font-semibold" : "text-foregroundTertiary"}`}>
          {compactSteps.format(steps.claimant)}
        </Text>
        <Text className={`text-[11px] ${steps.opponent > steps.claimant ? "font-semibold" : "text-foregroundTertiary"}`}>
          {compactSteps.format(steps.opponent)}
        </Text>
      </View>
      <View className="h-1.5 flex-row overflow-hidden rounded-full bg-foregroundTertiary/25">
        <View className="rounded-full bg-accent" style={{ width: `${claimantShare}%` }} />
      </View>
    </View>
  );
}

/**
 * Port of the web ContractCard: artwork, tier stars, title and points, description (plus your step
 * target), then who claimed it — with a live duel scoreboard — or Claim → Cancel / Confirm, or
 * "Come back tomorrow" at the daily cap. Faded, artwork in greyscale, once it's already met today.
 */
export function ContractCard({
  entry,
  pending,
  onClaim,
  claimDisabled,
  liveCompleted,
}: {
  entry: ContractBoardEntry;
  pending: boolean;
  onClaim: (contractId: string) => void;
  claimDisabled: boolean;
  liveCompleted: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const { contract, claim, targetSteps } = entry;

  return (
    <View className={`min-w-0 flex-1 gap-2 rounded-lg border bg-surface p-3 ${TIER_BORDER[contract.tier]} ${liveCompleted ? "opacity-55" : ""}`}>
      {!imageFailed && (
        // Greyscale once met, like the web's `grayscale` class.
        <View style={liveCompleted ? { filter: [{ grayscale: 1 }] } : undefined}>
          <Image
            source={{ uri: `${WEB_ORIGIN}/contracts/${contract.id}.png` }}
            onError={() => setImageFailed(true)}
            style={{ width: "100%", aspectRatio: 1, borderRadius: 6, borderWidth: 1, borderColor: colors.surfaceBorder }}
            contentFit="cover"
          />
        </View>
      )}
      <View className="flex-row items-start justify-between gap-1.5">
        <View className="min-w-0 flex-1">
          <TierStars tier={contract.tier} />
          <Text numberOfLines={1} className="font-semibold">
            {contract.title}
          </Text>
        </View>
        <View className="shrink-0 rounded-full border border-surfaceBorder bg-background px-1.5 py-0.5">
          <Text className="text-[10px] font-bold">{contract.points}pt</Text>
        </View>
      </View>
      <Text className="flex-1 text-xs text-foregroundSecondary">{contract.description}</Text>
      {targetSteps !== undefined && <Text className="text-xs font-semibold">Your target: {targetSteps.toLocaleString()} steps</Text>}

      {claim ? (
        <View className="mt-1 min-w-0 gap-1.5 rounded-md bg-background/60 px-2 py-1.5">
          <View className="min-w-0 flex-row items-start gap-1.5">
            <Avatar name={claim.userName} avatarUrl={claim.userAvatarUrl} size={16} />
            <Text numberOfLines={2} className="min-w-0 flex-1 text-xs text-foregroundTertiary">
              {claim.opponentName ? `${claim.userName} vs ${claim.opponentName}` : `Claimed by ${claim.userName}`}
            </Text>
            {liveCompleted && <Check size={14} color={colors.success} />}
          </View>
          {claim.opponentName && claim.duelSteps && claim.status === "claimed" && <DuelScoreboard steps={claim.duelSteps} />}
        </View>
      ) : confirming ? (
        <View className="mt-1 flex-row items-center gap-1.5">
          <Pressable onPress={() => setConfirming(false)} className="flex-1 items-center rounded-md border border-surfaceBorder px-2 py-1.5">
            <Text className="text-xs text-foregroundSecondary">Cancel</Text>
          </Pressable>
          <Pressable
            disabled={pending}
            onPress={() => onClaim(contract.id)}
            className={`flex-1 items-center rounded-md bg-accent px-2 py-1.5 ${pending ? "opacity-60" : ""}`}
          >
            <Text className="text-xs font-semibold text-accentForeground">{pending ? "Claiming…" : "Confirm"}</Text>
          </Pressable>
        </View>
      ) : claimDisabled ? (
        <View className="mt-1 rounded-md border border-dashed border-surfaceBorder px-2 py-1.5">
          <Text className="text-center text-xs text-foregroundTertiary">Come back tomorrow</Text>
        </View>
      ) : (
        <Pressable onPress={() => setConfirming(true)} className="mt-1 items-center rounded-md border border-dashed border-surfaceBorder px-2 py-1.5">
          <Text className="text-xs font-semibold text-accent">Claim</Text>
        </Pressable>
      )}
    </View>
  );
}
