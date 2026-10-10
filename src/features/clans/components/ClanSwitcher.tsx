import { useRouter } from "expo-router";
import { ChevronDown, Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { colors } from "@/styles/tokens";
import { useActiveClan } from "../ActiveClanProvider";

/**
 * Port of the web ClanSwitcher: current clan name + chevron, opening a "Switch clan" sheet with
 * your clans, then "Create a clan" and "Join with invite code".
 */
export function ClanSwitcher() {
  const router = useRouter();
  const { clans, activeClan, setActiveClanId } = useActiveClan();
  const [open, setOpen] = useState(false);

  function go(path: "/clans/new" | "/clans/join") {
    setOpen(false);
    router.push(path);
  }
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
        <View className="mt-4 gap-1 border-t border-surfaceBorder pt-4">
          <Pressable onPress={() => go("/clans/new")} className="min-h-11 flex-row items-center gap-2 rounded-lg px-3">
            <Plus size={16} color={colors.foregroundSecondary} />
            <Text className="text-sm text-foregroundSecondary">Create a clan</Text>
          </Pressable>
          <Pressable onPress={() => go("/clans/join")} className="min-h-11 flex-row items-center gap-2 rounded-lg px-3">
            <Plus size={16} color={colors.foregroundSecondary} />
            <Text className="text-sm text-foregroundSecondary">Join with invite code</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  );
}
