import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";

/** One web log-form card: rounded-xl surface box, p-5, emoji + title heading, optional right note. */
export function LogSection({ emoji, title, aside, children }: { emoji: string; title: string; aside?: string; children: ReactNode }) {
  return (
    <View className="gap-3 rounded-xl border border-surfaceBorder bg-surface p-5">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Text className="font-semibold">{emoji}</Text>
          <Text className="font-semibold">{title}</Text>
        </View>
        {aside ? <Text className="text-xs text-foregroundTertiary">{aside}</Text> : null}
      </View>
      {children}
    </View>
  );
}
