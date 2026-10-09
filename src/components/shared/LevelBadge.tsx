import { View } from "react-native";
import { Text } from "@/components/ui/Text";

/** Port of the web LevelBadge: neutral below 10, accent from 10, amber from 25. */
export function LevelBadge({ level }: { level: number }) {
  const tier =
    level >= 25
      ? { box: "border-amber-400/60 bg-amber-400/20", label: "text-amber-600" }
      : level >= 10
        ? { box: "border-accent/60 bg-accent/10", label: "text-accent" }
        : { box: "border-surfaceBorder bg-surface", label: "text-foregroundTertiary" };
  return (
    <View className={`shrink-0 flex-row items-center rounded-full border px-1.5 py-0.5 ${tier.box}`}>
      <Text className={`text-[10px] font-bold tracking-tight ${tier.label}`}>Lv {level}</Text>
    </View>
  );
}
