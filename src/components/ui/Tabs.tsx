import { useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./Text";

export type TabItem = { id: string; label: string; content: ReactNode };

/**
 * Port of the web Tabs: a rounded-full pill bar on surface, the active tab filled accent, and the
 * active panel below with 20px between.
 */
export function Tabs({ tabs, defaultTabId }: { tabs: TabItem[]; defaultTabId?: string }) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <View className="gap-5">
      <View accessibilityRole="tablist" className="flex-row gap-1 rounded-full border border-surfaceBorder bg-surface p-1">
        {tabs.map((tab) => {
          const selected = tab.id === active?.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setActiveId(tab.id)}
              className={`min-h-9 min-w-0 flex-1 items-center justify-center rounded-full px-3 ${selected ? "bg-accent" : ""}`}
            >
              <Text numberOfLines={1} className={`text-sm font-semibold ${selected ? "text-accentForeground" : "text-foregroundTertiary"}`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="gap-4">{active?.content}</View>
    </View>
  );
}
