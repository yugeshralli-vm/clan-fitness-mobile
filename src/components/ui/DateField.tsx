import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { colors } from "@/styles/tokens";
import { Text } from "./Text";

function toDayKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * The web's <input type="date">: an input-styled field that opens Android's calendar, holding the
 * value as YYYY-MM-DD. Dates after `maximumDate` can't be picked; "Clear" empties it, like the web.
 */
export function DateField({
  value,
  onChange,
  maximumDate,
  placeholder = "Select date",
}: {
  value: string;
  onChange: (value: string) => void;
  maximumDate?: Date;
  placeholder?: string;
}) {
  function open() {
    const [y, m, d] = value.split("-").map(Number);
    DateTimePickerAndroid.open({
      mode: "date",
      value: value ? new Date(y, m - 1, d) : new Date(2000, 0, 1),
      maximumDate,
      onChange: (event, date) => {
        if (event.type === "set" && date) onChange(toDayKey(date));
      },
    });
  }

  const label = value
    ? new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : placeholder;

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        onPress={open}
        accessibilityRole="button"
        className="min-w-0 flex-1 flex-row items-center justify-between rounded-lg border border-surfaceBorder bg-surface px-3 py-2.5"
      >
        <Text className={value ? "" : "text-foregroundMuted"}>{label}</Text>
        <Calendar size={16} color={colors.foregroundTertiary} />
      </Pressable>
      {value ? (
        <Pressable onPress={() => onChange("")} className="min-h-11 justify-center">
          <Text className="text-sm text-foregroundTertiary">Clear</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
