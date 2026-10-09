import { Text, TextInput, View } from "react-native";

type Props = {
  count: string;
  dailyStepsTarget: number;
  onCountChange: (value: string) => void;
};

export function StepsSection({ count, dailyStepsTarget, onCountChange }: Props) {
  return (
    <View className="gap-3 rounded-lg border border-surfaceBorder bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">👟 Steps</Text>
        <Text className="text-xs text-foregroundTertiary">Goal: {dailyStepsTarget.toLocaleString()}</Text>
      </View>
      <TextInput
        value={count}
        onChangeText={onCountChange}
        placeholder="0"
        placeholderTextColor="rgba(255,255,255,0.3)"
        keyboardType="number-pad"
        className="rounded-lg border border-surfaceBorder bg-background px-3 py-2 text-foreground"
      />
    </View>
  );
}
