import { Check } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/styles/tokens";
import { Text } from "./Text";

/**
 * Port of the web log form's checkbox/radio "pill" labels (TOGGLE_LABEL_CLASS): 44px-tall rounded
 * pill with a 20px control on the left; border and label turn accent when selected.
 */
export function Toggle({
  kind,
  checked,
  onPress,
  children,
}: {
  kind: "checkbox" | "radio";
  checked: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={kind}
      accessibilityState={{ checked }}
      className={`min-h-11 flex-row items-center gap-2 self-start rounded-full border px-4 ${checked ? "border-accent" : "border-surfaceBorder"}`}
    >
      {kind === "checkbox" ? (
        <View className={`h-5 w-5 items-center justify-center rounded-sm ${checked ? "bg-accent" : "bg-white"}`}>
          {checked && <Check size={14} strokeWidth={3} color={colors.accentForeground} />}
        </View>
      ) : (
        <View className={`h-5 w-5 items-center justify-center rounded-full ${checked ? "bg-accent" : "bg-white"}`}>
          {checked && <View className="h-2 w-2 rounded-full bg-accentForeground" />}
        </View>
      )}
      <Text className={`text-sm font-medium ${checked ? "text-accent" : "text-foregroundSecondary"}`}>{children}</Text>
    </Pressable>
  );
}
