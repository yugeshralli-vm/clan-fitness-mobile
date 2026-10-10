import { ScrollView } from "react-native";
import { Text } from "@/components/ui/Text";
import { CreateClanForm } from "@/features/clans";

/** Web /clans/new. */
export default function NewClanScreen() {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, gap: 24 }} keyboardShouldPersistTaps="handled">
      <Text className="text-2xl font-bold">Create a clan</Text>
      <CreateClanForm />
    </ScrollView>
  );
}
