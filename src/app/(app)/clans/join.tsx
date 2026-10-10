import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { Text } from "@/components/ui/Text";
import { JoinClanForm } from "@/features/clans";

/** Web /clans/join (?code= pre-fills the invite code). */
export default function JoinClanScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, gap: 24 }} keyboardShouldPersistTaps="handled">
      <Text className="text-2xl font-bold">Join a clan</Text>
      <JoinClanForm defaultInviteCode={code} />
    </ScrollView>
  );
}
