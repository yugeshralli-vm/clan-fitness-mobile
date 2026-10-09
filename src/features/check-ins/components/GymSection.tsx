import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  workedOut: boolean;
  note: string;
  onWorkedOutChange: (value: boolean) => void;
  onNoteChange: (value: string) => void;
};

export function GymSection({ workedOut, note, onWorkedOutChange, onNoteChange }: Props) {
  return (
    <View className="gap-3 rounded-lg border border-surfaceBorder bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">💪 Gym</Text>
        <Pressable
          onPress={() => onWorkedOutChange(!workedOut)}
          className={`rounded-full px-4 py-1.5 ${workedOut ? "bg-accent" : "bg-background"}`}
        >
          <Text className={workedOut ? "font-semibold text-accentForeground" : "text-foregroundSecondary"}>
            {workedOut ? "Worked out" : "Mark done"}
          </Text>
        </Pressable>
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
