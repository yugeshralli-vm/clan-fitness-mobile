import { useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./Text";

export type TabItem = { id: string; label: string; content: ReactNode };

/**
 * Port of the web Tabs: a rounded-full pill bar on surface, the active tab filled accent, and the
 * panels below with 20px between. Like the web, every panel stays rendered and stacked in the same
 * spot — only the active one visible and touchable — so the height is the tallest panel's and
 * doesn't jump when switching tabs.
 */
export function Tabs({ tabs, defaultTabId }: { tabs: TabItem[]; defaultTabId?: string }) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const tallest = Math.max(0, ...Object.values(heights));

  return (
    <View className="gap-5">
      <View accessibilityRole="tablist" className="flex-row gap-1 rounded-full border border-surfaceBorder bg-surface p-1">
        {tabs.map((tab) => {
          const selected = tab.id === activeId;
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
      <View style={{ minHeight: tallest }}>
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <View
              key={tab.id}
              onLayout={(event) => {
                const height = event.nativeEvent.layout.height;
                setHeights((prev) => (prev[tab.id] === height ? prev : { ...prev, [tab.id]: height }));
              }}
              pointerEvents={active ? "auto" : "none"}
              importantForAccessibility={active ? "auto" : "no-hide-descendants"}
              className="absolute left-0 right-0 top-0 gap-4"
              style={{ opacity: active ? 1 : 0 }}
            >
              {tab.content}
            </View>
          );
        })}
      </View>
    </View>
  );
}
