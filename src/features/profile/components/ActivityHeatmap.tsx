import { ScrollView, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { HeatmapDayState, ProfileResponse } from "../types";

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATE_CLASS: Record<HeatmapDayState, string> = {
  met: "bg-accent",
  under: "bg-accent/50",
  none: "bg-surfaceBorder",
  future: "bg-transparent",
};

type Day = ProfileResponse["heatmap"][number];

/**
 * Port of the web ActivityHeatmap: this month's days laid out GitHub-style — rows are day of the
 * week, columns are weeks — met / under the steps goal / nothing logged, with the Less–More key.
 */
export function ActivityHeatmap({ days }: { days: Day[] }) {
  if (days.length === 0) return null;

  const firstDayOfWeek = days[0].dayOfWeek;
  const totalColumns = Math.ceil((firstDayOfWeek + days.length) / 7);
  const grid: (Day | null)[][] = Array.from({ length: totalColumns }, () => Array(7).fill(null));
  days.forEach((day, index) => {
    const absolute = firstDayOfWeek + index;
    grid[Math.floor(absolute / 7)][absolute % 7] = day;
  });
  // dayKey is the profile owner's own calendar date; read it as UTC so no zone shifts the month.
  const monthLabel = new Date(`${days[0].dayKey}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <View className="gap-3 rounded-xl border border-surfaceBorder bg-surface p-5">
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold">Activity</Text>
        <Text className="text-xs text-foregroundTertiary">{monthLabel}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 3 }}>
        <View className="pr-1" style={{ gap: 3 }}>
          {DOW_LABELS.map((label) => (
            <View key={label} className="h-3 justify-center">
              <Text className="text-[10px] leading-3 text-foregroundTertiary">{label}</Text>
            </View>
          ))}
        </View>
        {grid.map((column, colIndex) => (
          <View key={colIndex} style={{ gap: 3 }}>
            {column.map((day, row) => (
              <View key={row} className={`h-3 w-3 ${day ? STATE_CLASS[day.state] : "bg-transparent"}`} style={{ borderRadius: 3 }} />
            ))}
          </View>
        ))}
      </ScrollView>

      <View className="flex-row items-center justify-end gap-1.5">
        <Text className="text-[10px] text-foregroundTertiary">Less</Text>
        <View className="h-3 w-3 bg-surfaceBorder" style={{ borderRadius: 3 }} />
        <View className="h-3 w-3 bg-accent/50" style={{ borderRadius: 3 }} />
        <View className="h-3 w-3 bg-accent" style={{ borderRadius: 3 }} />
        <Text className="text-[10px] text-foregroundTertiary">More</Text>
      </View>
    </View>
  );
}
