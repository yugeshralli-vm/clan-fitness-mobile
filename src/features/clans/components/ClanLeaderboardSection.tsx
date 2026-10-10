import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { OnlineAvatar } from "@/components/shared/OnlineAvatar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { colors } from "@/styles/tokens";
import type { LeaderboardEntry, LeaderboardPeriod } from "../types";

const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

const PERIOD_LABELS: Record<LeaderboardPeriod, string> = { today: "Today", yesterday: "Yesterday", week: "Weekly", month: "Monthly" };
const PERIODS: LeaderboardPeriod[] = ["today", "yesterday", "week", "month"];

/**
 * Port of the web ClanLeaderboardSection: a period picker (Weekly by default), then per member
 * steps and gym against goal — tap the numbers to flip the whole board to percent of goal — and
 * the streak in ember.
 */
export function ClanLeaderboardSection({
  leaderboards,
  onOpenMember,
}: {
  leaderboards: Record<LeaderboardPeriod, LeaderboardEntry[]>;
  onOpenMember?: (userId: string) => void;
}) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showPercent, setShowPercent] = useState(false);
  const leaderboard = leaderboards[period];
  // Single days: a prorated gym target ("1/0.57") reads as a bug there, so it's just ✓ or – (as web).
  const isDailyView = period === "today" || period === "yesterday";

  return (
    <View className="gap-1 rounded-xl border border-surfaceBorder bg-surface p-5">
      <Pressable onPress={() => setPickerOpen(true)} className="mb-2 min-h-9 flex-row items-center gap-1 self-start">
        <Text className="font-semibold">{PERIOD_LABELS[period]}</Text>
        <ChevronDown size={16} color={colors.foregroundTertiary} />
      </Pressable>

      <View>
        {leaderboard.map(({ user, periodCount, periodTarget, periodSteps, periodStepsTarget, streak, stepPct, gymPct }, i) => (
          <View
            key={user.id}
            className={`min-w-0 flex-row items-center gap-3 ${i > 0 ? "border-t border-surfaceBorder pt-3" : ""} ${
              i < leaderboard.length - 1 ? "pb-3" : ""
            }`}
          >
            <Pressable onPress={() => onOpenMember?.(user.id)} disabled={!onOpenMember} className="min-w-0 flex-1 flex-row items-center gap-3">
              <OnlineAvatar userId={user.id} name={user.name} avatarUrl={user.avatarUrl} />
              <Text numberOfLines={1} className="min-w-0 flex-1 text-sm">
                {user.name}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowPercent((prev) => !prev)}
              accessibilityLabel="Toggle whole leaderboard between raw values and percent of goal"
              className="min-h-11 shrink-0 items-end justify-center"
            >
              <Text className="text-sm text-foregroundSecondary">
                {showPercent ? (
                  <>
                    <Text className="text-sm font-bold text-accent">{Math.round(stepPct)}%</Text>{" "}
                    <Text className="text-sm text-foregroundTertiary">steps</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-sm font-bold text-accent">{compactNumber.format(periodSteps)}</Text>/
                    {compactNumber.format(periodStepsTarget)} <Text className="text-sm text-foregroundTertiary">steps</Text>
                  </>
                )}
              </Text>
              <Text className="text-sm text-foregroundSecondary">
                {isDailyView ? (
                  periodCount > 0 ? (
                    <Text className="text-sm text-success">✓ gym</Text>
                  ) : (
                    <Text className="text-sm text-foregroundMuted">– gym</Text>
                  )
                ) : showPercent ? (
                  <>
                    <Text className="text-sm font-bold text-accent">{Math.round(gymPct)}%</Text>{" "}
                    <Text className="text-sm text-foregroundTertiary">gym</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-sm font-bold text-accent">{periodCount}</Text>/{compactNumber.format(periodTarget)}{" "}
                    <Text className="text-sm text-foregroundTertiary">gym</Text>
                  </>
                )}
              </Text>
            </Pressable>
            <Text className="shrink-0 text-sm font-semibold text-ember">{streak}🔥</Text>
          </View>
        ))}
      </View>

      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Show leaderboard for">
        <View className="gap-1">
          {PERIODS.map((p) => (
            <Pressable
              key={p}
              onPress={() => {
                setPeriod(p);
                setPickerOpen(false);
              }}
              className={`min-h-11 justify-center rounded-lg px-3 ${p === period ? "bg-accent/10" : ""}`}
            >
              <Text className={`text-sm ${p === period ? "font-semibold text-accent" : ""}`}>{PERIOD_LABELS[p]}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}
