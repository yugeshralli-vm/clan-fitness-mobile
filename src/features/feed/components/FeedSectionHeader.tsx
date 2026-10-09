import { Text, View } from "react-native";

type Props = {
  dayLabel: string;
};

export function FeedSectionHeader({ dayLabel }: Props) {
  return (
    <View className="bg-background px-4 pb-2 pt-4">
      <Text className="text-xs font-semibold uppercase tracking-wide text-foregroundTertiary">{dayLabel}</Text>
    </View>
  );
}
