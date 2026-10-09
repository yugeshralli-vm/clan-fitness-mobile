import { Pressable, Text, TextInput, View } from "react-native";
import type { FoodStatus } from "../types";

const OPTIONS: { value: FoodStatus; label: string }[] = [
  { value: "yes", label: "On track" },
  { value: "partial", label: "Partial" },
  { value: "no", label: "Off track" },
];

type Props = {
  status: FoodStatus | undefined;
  note: string;
  onStatusChange: (value: FoodStatus) => void;
  onNoteChange: (value: string) => void;
};

export function FoodSection({ status, note, onStatusChange, onNoteChange }: Props) {
  return (
    <View className="gap-3 rounded-lg border border-surfaceBorder bg-surface p-4">
      <Text className="text-base font-semibold text-foreground">🥗 Food</Text>
      <View className="flex-row gap-2">
        {OPTIONS.map((option) => {
          const selected = status === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onStatusChange(option.value)}
              className={`flex-1 items-center rounded-lg py-2 ${selected ? "bg-accent" : "bg-background"}`}
            >
              <Text className={selected ? "font-semibold text-accentForeground" : "text-foregroundSecondary"}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        value={note}
        onChangeText={onNoteChange}
        placeholder="Add a note (optional)"
        placeholderTextColor="rgba(255,255,255,0.3)"
        className="rounded-lg border border-surfaceBorder bg-background px-3 py-2 text-foreground"
      />
    </View>
  );
}
