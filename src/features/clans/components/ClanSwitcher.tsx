import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { colors } from "@/styles/tokens";
import { useActiveClan } from "../ActiveClanProvider";

/** Port of the web ClanSwitcher: current clan name + chevron, opening a "Switch clan" sheet. */
export function ClanSwitcher() {
  const { clans, activeClan, setActiveClanId } = useActiveClan();
  const [open, setOpen] = useState(false);
  if (!activeClan) return null;

  return (
    <>
      <Pressable onPress={() => setOpen(true)} className="min-h-11 shrink flex-row items-center gap-1" style={{ maxWidth: "45%" }}>
        <Text className="shrink text-sm font-semibold" numberOfLines={1}>
          {activeClan.name}
        </Text>
        <ChevronDown size={16} color={colors.foregroundTertiary} />
      </Pressable>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Switch clan">
        <View className="gap-1">
          {clans.map((clan) => {
            const current = clan.id === activeClan.id;
            return (
              <Pressable
                key={clan.id}
                onPress={() => {
                  setActiveClanId(clan.id);
                  setOpen(false);
                }}
                className={`min-h-11 justify-center rounded-lg px-3 ${current ? "bg-accent/10" : ""}`}
              >
                <Text className={`text-sm ${current ? "font-semibold text-accent" : ""}`}>{clan.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}
