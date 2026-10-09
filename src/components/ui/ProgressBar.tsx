import { View } from "react-native";
import { colors } from "@/styles/tokens";

/** Port of the web ProgressBar: 8px track in surface-border, rounded fill. */
export function ProgressBar({ value, max, color = colors.accent }: { value: number; max: number; color?: string }) {
  const percent = max > 0 ? Math.min(value / max, 1) * 100 : 0;
  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-surfaceBorder">
      <View className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
    </View>
  );
}
