import { useRouter } from "expo-router";
import { ChevronRight, ScrollText } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors } from "@/styles/tokens";

/** Port of the web ContractsCard: the clan page's link to its contracts board. */
export function ContractsCard({ clanId }: { clanId: string }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/clans/[clanId]/contracts", params: { clanId } })}
      className="flex-row items-center gap-3 rounded-lg border border-surfaceBorder bg-surface px-4 py-3"
    >
      <ScrollText size={20} color={colors.accent} />
      <View className="min-w-0 flex-1">
        <Text className="font-semibold">Contracts</Text>
        <Text className="text-xs text-foregroundTertiary">Claim a daily contract to earn points</Text>
      </View>
      <ChevronRight size={18} color={colors.foregroundTertiary} />
    </Pressable>
  );
}
