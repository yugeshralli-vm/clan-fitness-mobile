import { View } from "react-native";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Text } from "@/components/ui/Text";
import type { LogsResponse } from "../types";

/** Port of the summary card at the top of the web Log page: date, weekly gym ring, streak, steps bar. */
export function LogSummaryCard({ logs, timezone }: { logs: LogsResponse; timezone: string }) {
  const steps = logs.steps?.count ?? 0;
  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: timezone });
  return (
    <View className="gap-5 rounded-xl border border-surfaceBorder bg-surface p-5">
      <Text className="text-sm font-semibold text-foregroundSecondary">{date}</Text>

      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-row items-center gap-4">
          <ProgressRing value={logs.weeklyGymCount} max={logs.weeklyGymTarget}>
            <Text className="text-lg font-bold">
              {logs.weeklyGymCount}
              <Text className="text-lg font-bold text-foregroundTertiary">/{logs.weeklyGymTarget}</Text>
            </Text>
            <Text className="text-[10px] font-semibold uppercase tracking-wide text-foregroundTertiary">days</Text>
          </ProgressRing>
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wide text-foregroundTertiary">This week</Text>
            <Text className="text-sm text-foregroundSecondary">gym days</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xs font-semibold uppercase tracking-wide text-foregroundTertiary">Streak</Text>
          <Text className="text-3xl font-bold text-ember">{logs.gymStreak} 🔥</Text>
        </View>
      </View>

      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          {/* flex-1: Android under-measures uppercase + letter-spaced text in a row and drops "TODAY". */}
          <Text className="flex-1 text-xs font-semibold uppercase tracking-wide text-foregroundTertiary">Steps today</Text>
          <Text className="shrink-0 text-xs text-foregroundSecondary">
            {steps.toLocaleString("en-US")} / {logs.dailyStepsTarget.toLocaleString("en-US")}
          </Text>
        </View>
        <ProgressBar value={steps} max={logs.dailyStepsTarget} />
      </View>
    </View>
  );
}
