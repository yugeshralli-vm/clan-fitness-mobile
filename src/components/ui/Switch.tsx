import { Pressable, View } from "react-native";
import { Text } from "./Text";

/** Port of the web Switch: label on the left, a 44×24 track (accent when on) with a white knob. */
export function Switch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      className="flex-row items-center justify-between gap-3 py-1"
    >
      <Text className="text-sm font-medium">{label}</Text>
      <View className={`h-6 w-11 shrink-0 justify-center rounded-full ${value ? "bg-accent" : "bg-surfaceBorder"}`}>
        <View className="h-4 w-4 rounded-full bg-white" style={{ marginLeft: value ? 24 : 4 }} />
      </View>
    </Pressable>
  );
}
