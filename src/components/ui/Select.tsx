import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/styles/tokens";
import { BottomSheet } from "./BottomSheet";
import { Text } from "./Text";

/**
 * The web form's native <select> (SELECT_CLASS: input-styled box), as a field that opens a sheet of
 * options — the same pattern as the app's other pickers.
 */
export function Select<T extends string>({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="combobox"
        className="w-full flex-row items-center justify-between rounded-lg border border-surfaceBorder bg-surface px-3 py-2.5"
      >
        <Text>{options.find((o) => o.value === value)?.label}</Text>
        <ChevronDown size={16} color={colors.foregroundTertiary} />
      </Pressable>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={title}>
        <View className="gap-1">
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`min-h-11 justify-center rounded-lg px-3 ${option.value === value ? "bg-accent/10" : ""}`}
            >
              <Text className={`text-sm ${option.value === value ? "font-semibold text-accent" : ""}`}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </>
  );
}
