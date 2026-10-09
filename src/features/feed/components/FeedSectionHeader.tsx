import { Text } from "@/components/ui/Text";

/** Web FeedList's day heading: xs, semibold, uppercase, wide tracking, tertiary. */
export function FeedSectionHeader({ dayLabel }: { dayLabel: string }) {
  return <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-foregroundTertiary">{dayLabel}</Text>;
}
