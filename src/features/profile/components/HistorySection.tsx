import { Image } from "expo-image";
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { colors } from "@/styles/tokens";
import { getHistory } from "../services/profile";
import type { CheckInType, HistoryPage, HistoryRange } from "../types";

const TYPE_OPTIONS: { value: CheckInType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "gym", label: "Gym" },
  { value: "steps", label: "Steps" },
  { value: "food", label: "Food" },
];

const RANGE_OPTIONS: { value: HistoryRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

function localDayKey(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date);
}

function dayLabel(dayKey: string, timezone: string) {
  const now = new Date();
  if (dayKey === localDayKey(now, timezone)) return "Today";
  if (dayKey === localDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000), timezone)) return "Yesterday";
  return new Date(`${dayKey}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
}

/**
 * Port of the web HistorySection: type chips (All/Gym/Steps/Food) and a range picker (30 days by
 * default), each day's entries as small cards with food photos, and Load more.
 */
export function HistorySection({ userId, timezone, initial }: { userId: string; timezone: string; initial: HistoryPage }) {
  const getToken = useApiToken();
  const [type, setType] = useState<CheckInType | "all">("all");
  const [range, setRange] = useState<HistoryRange>("30d");
  const [rangePickerOpen, setRangePickerOpen] = useState(false);
  const [days, setDays] = useState(initial.days);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [pending, setPending] = useState(false);

  async function applyFilters(nextType: CheckInType | "all", nextRange: HistoryRange) {
    setType(nextType);
    setRange(nextRange);
    setPending(true);
    try {
      const page = await getHistory(getToken, userId, nextType, nextRange);
      setDays(page.days);
      setHasMore(page.hasMore);
    } catch {
      // Keep what's shown; picking the filter again retries.
    } finally {
      setPending(false);
    }
  }

  async function handleLoadMore() {
    const lastDay = days[days.length - 1];
    const lastEntry = lastDay?.entries[lastDay.entries.length - 1];
    if (!lastEntry) return;
    setPending(true);
    try {
      const page = await getHistory(getToken, userId, type, range, lastEntry.createdAt);
      setDays((prev) => [...prev, ...page.days]);
      setHasMore(page.hasMore);
    } catch {
      // "Load more" stays, so another tap retries.
    } finally {
      setPending(false);
    }
  }

  return (
    <View className="gap-4 rounded-xl border border-surfaceBorder bg-surface p-5">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="font-semibold">History</Text>
        <Pressable onPress={() => setRangePickerOpen(true)} className="min-h-9 flex-row items-center gap-1">
          <Text className="text-sm text-foregroundSecondary">{RANGE_OPTIONS.find((r) => r.value === range)?.label}</Text>
          <ChevronDown size={14} color={colors.foregroundTertiary} />
        </Pressable>
      </View>

      <View className="flex-row gap-2">
        {TYPE_OPTIONS.map((option) => {
          const selected = type === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => applyFilters(option.value, range)}
              className={`min-h-9 justify-center rounded-full border px-3 ${selected ? "border-accent bg-accent/10" : "border-surfaceBorder"}`}
            >
              <Text className={`text-sm font-medium ${selected ? "text-accent" : "text-foregroundTertiary"}`}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {days.length === 0 && !pending ? (
        <Text className="py-6 text-center text-sm text-foregroundTertiary">No logs in this range.</Text>
      ) : (
        <View className={`gap-4 ${pending ? "opacity-50" : ""}`}>
          {days.map((day) => (
            <View key={day.dayKey} className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-foregroundTertiary">{dayLabel(day.dayKey, timezone)}</Text>
              <View className="gap-2">
                {day.entries.map((entry) => (
                  <View key={entry.id} className="gap-1.5 rounded-lg border border-surfaceBorder bg-background p-3">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-sm text-foregroundSecondary">{entry.icon}</Text>
                      <Text className="shrink text-sm text-foregroundSecondary">{entry.caption}</Text>
                    </View>
                    {entry.photoUrls.length > 0 && (
                      <View className="flex-row gap-1.5">
                        {entry.photoUrls.map((url) => (
                          <Image key={url} source={{ uri: url }} style={{ width: 56, height: 56, borderRadius: 8 }} contentFit="cover" />
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {hasMore && (
        <Pressable onPress={handleLoadMore} disabled={pending} className={`min-h-11 items-center justify-center self-center px-4 ${pending ? "opacity-40" : ""}`}>
          {pending ? <ActivityIndicator size="small" color={colors.accent} /> : <Text className="text-sm font-semibold text-accent">Load more</Text>}
        </Pressable>
      )}

      <BottomSheet open={rangePickerOpen} onClose={() => setRangePickerOpen(false)} title="Show history for">
        <View className="gap-1">
          {RANGE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                applyFilters(type, option.value);
                setRangePickerOpen(false);
              }}
              className={`min-h-11 justify-center rounded-lg px-3 ${option.value === range ? "bg-accent/10" : ""}`}
            >
              <Text className={`text-sm ${option.value === range ? "font-semibold text-accent" : ""}`}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}
