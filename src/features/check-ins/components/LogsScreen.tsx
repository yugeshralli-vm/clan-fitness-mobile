import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSaveLog } from "../hooks/useSaveLog";
import { useTodaysLogs } from "../hooks/useTodaysLogs";
import type { FoodStatus } from "../types";
import { FoodSection } from "./FoodSection";
import { GymSection } from "./GymSection";
import { StepsSection } from "./StepsSection";
import { ThoughtSection } from "./ThoughtSection";

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
    setWorkedOut(!!logs.gym);
    setGymNote(logs.gym?.note ?? "");
    setStepsCount(logs.steps ? String(logs.steps.count) : "");
    setFoodStatus(logs.food?.status);
    setFoodNote(logs.food?.note ?? "");
    setThought(logs.thought?.text ?? "");
  }, [logs]);

  function handleSave() {
    const parsedSteps = stepsCount.trim() ? Number(stepsCount) : undefined;
    save({
      timezone,
      workedOut,
      gymNote: gymNote || undefined,
      stepsCount: parsedSteps,
      foodStatus,
      foodNote: foodNote || undefined,
      thought: thought || undefined,
    });
  }

  if (loading && !logs) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foregroundTertiary">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-4"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
    >
      <Text className="mb-1 text-2xl font-bold text-foreground">Today's Log</Text>
      {loadError && <Text className="text-sm text-danger">{loadError}</Text>}

      <GymSection workedOut={workedOut} note={gymNote} onWorkedOutChange={setWorkedOut} onNoteChange={setGymNote} />
      <StepsSection
        count={stepsCount}
        dailyStepsTarget={logs?.dailyStepsTarget ?? 8000}
        onCountChange={setStepsCount}
      />
      <FoodSection status={foodStatus} note={foodNote} onStatusChange={setFoodStatus} onNoteChange={setFoodNote} />
      <ThoughtSection text={thought} onTextChange={setThought} />

      {saveError && <Text className="text-sm text-danger">{saveError}</Text>}
      <Pressable
        onPress={handleSave}
        disabled={saving}
        className="items-center rounded-lg bg-accent py-3 disabled:opacity-40"
      >
        <Text className="font-bold text-accentForeground">{saving ? "Saving..." : "Save"}</Text>
      </Pressable>
    </ScrollView>
  );
}
