import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Toggle } from "@/components/ui/Toggle";
import { colors } from "@/styles/tokens";
import { useSaveLog } from "../hooks/useSaveLog";
import { useTodaysLogs } from "../hooks/useTodaysLogs";
import type { FoodStatus } from "../types";
import { LogSection } from "./LogSection";
import { LogSummaryCard } from "./LogSummaryCard";

// Same labels/order as the web form's STATUS_OPTIONS.
const STATUS_OPTIONS: { value: FoodStatus; label: string }[] = [
  { value: "yes", label: "Hit it" },
  { value: "no", label: "Missed it" },
  { value: "partial", label: "Partial" },
];

/**
 * Port of the web Log page (/logs): the summary card, then DailyLogForm's sections — Gym, Steps,
 * Nutrition, Photo, Thought — and the save button, with the web copy and spacing (px-6 py-8, 32px
 * after the summary card, 24px between sections).
 */
export function LogsScreen() {
  const { logs, setLogs, error: loadError, loading, refresh, timezone } = useTodaysLogs();
  const { save, saving, error: saveError } = useSaveLog(setLogs);

  const [workedOut, setWorkedOut] = useState(false);
  const [gymNote, setGymNote] = useState("");
  const [stepsCount, setStepsCount] = useState("");
  const [foodStatus, setFoodStatus] = useState<FoodStatus | undefined>(undefined);
  const [foodNote, setFoodNote] = useState("");
  const [thought, setThought] = useState("");

  useEffect(() => {
    if (!logs) return;
    setWorkedOut(false);
    setGymNote(logs.gym?.note ?? "");
    setStepsCount(logs.steps ? String(logs.steps.count) : "");
    setFoodStatus(logs.food?.status);
    setFoodNote(logs.food?.note ?? "");
    setThought(logs.thought?.text ?? "");
  }, [logs]);

  if (!logs) {
    return (
      <View className="flex-1 items-center justify-center">
        {loadError ? <Text className="text-danger">{loadError}</Text> : <ActivityIndicator color={colors.accent} />}
      </View>
    );
  }

  const alreadyWorkedOut = !!logs.gym;
  const existingPhotos = logs.food?.photoUrls ?? [];

  function handleSave() {
    save({
      timezone,
      workedOut,
      gymNote: gymNote.trim() || undefined,
      stepsCount: stepsCount.trim() ? Number(stepsCount) : undefined,
      foodStatus,
      foodNote: foodNote.trim() || undefined,
      thought: thought.trim() || undefined,
    });
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, gap: 32 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.accent} colors={[colors.accent]} />}
    >
      <LogSummaryCard logs={logs} timezone={timezone} />

      <View className="gap-6">
        <LogSection emoji="💪" title="Gym">
          {alreadyWorkedOut ? (
            <>
              <Text className="text-sm text-foregroundSecondary">You already logged a workout today. 🔥</Text>
              <Input value={gymNote} onChangeText={setGymNote} placeholder="Update note (e.g. leg day)" maxLength={200} multiline />
            </>
          ) : (
            <>
              <Toggle kind="checkbox" checked={workedOut} onPress={() => setWorkedOut((v) => !v)}>
                I worked out today 💪
              </Toggle>
              <Input value={gymNote} onChangeText={setGymNote} placeholder="Optional note (e.g. leg day)" maxLength={200} multiline />
            </>
          )}
        </LogSection>

        <LogSection emoji="👟" title="Steps" aside={`Goal: ${logs.dailyStepsTarget.toLocaleString("en-US")}/day`}>
          <Input
            value={stepsCount}
            onChangeText={(text) => setStepsCount(text.replace(/[^0-9]/g, ""))}
            placeholder="Steps today"
            keyboardType="number-pad"
          />
        </LogSection>

        <LogSection emoji="🥗" title="Nutrition">
          {logs.food?.status && <Text className="text-sm text-foregroundSecondary">You already logged nutrition today.</Text>}
          <View className="flex-row flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <Toggle key={option.value} kind="radio" checked={foodStatus === option.value} onPress={() => setFoodStatus(option.value)}>
                {option.label}
              </Toggle>
            ))}
          </View>
          <Input value={foodNote} onChangeText={setFoodNote} placeholder="Optional note (e.g. meal prepped)" maxLength={200} multiline />
        </LogSection>

        <LogSection emoji="📷" title="Photo" aside="Optional">
          <Text className="text-xs text-foregroundTertiary">
            {existingPhotos.length > 0 ? `${existingPhotos.length}/3 photos` : "Saves on their own, no other answer needed"}
          </Text>
          {existingPhotos.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {existingPhotos.map((url) => (
                <Image key={url} source={{ uri: url }} style={{ width: 56, height: 56, borderRadius: 8 }} contentFit="cover" />
              ))}
            </View>
          )}
          <Text className="text-xs text-foregroundMuted">Adding photos from the app is coming in the next update.</Text>
        </LogSection>

        <LogSection emoji="💭" title="Thought" aside="Optional">
          <Input value={thought} onChangeText={setThought} placeholder="What's on your mind?" maxLength={200} multiline />
        </LogSection>

        {saveError && <Text className="text-sm text-danger">{saveError}</Text>}
        <Button
          title={saving ? "Saving..." : logs.hasLoggedToday ? "Update today's log" : "Save today's log"}
          onPress={handleSave}
          disabled={saving}
        />
      </View>
    </ScrollView>
  );
}
