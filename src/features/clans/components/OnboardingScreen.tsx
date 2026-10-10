import { useAuth } from "@clerk/expo";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { LOGO_SVG } from "@/components/shared/logo-svg";
import { Text } from "@/components/ui/Text";
import { CreateClanForm, JoinClanForm } from "./ClanForms";

/**
 * Port of the web /onboarding page, for someone in no clan yet: logo (and a way out — the web's
 * Clerk UserButton), "Join or create a clan", then both forms.
 */
export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 48, paddingBottom: insets.bottom + 48, gap: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-row items-center justify-between gap-3">
        <SvgXml xml={LOGO_SVG} height={28} width={112} />
        <Pressable onPress={() => signOut()} className="min-h-11 justify-center">
          <Text className="text-sm text-foregroundTertiary">Sign out</Text>
        </Pressable>
      </View>
      <View className="gap-2">
        <Text className="text-3xl font-bold">Join or create a clan</Text>
        <Text className="text-foregroundSecondary">You need to be in a clan to start tracking.</Text>
        <Text className="text-sm text-foregroundTertiary">
          A clan is your accountability squad — up to 15 people, usually friends, a team, or a group chat. Have an invite code? Join below.
          Otherwise, start your own.
        </Text>
      </View>
      <View className="gap-4">
        <Text className="font-semibold">Create a clan</Text>
        <CreateClanForm />
      </View>
      <View className="gap-4">
        <Text className="font-semibold">Join with an invite code</Text>
        <JoinClanForm />
      </View>
    </ScrollView>
  );
}
