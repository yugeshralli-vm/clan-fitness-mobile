import { useAuth } from "@clerk/expo";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { DeleteAccountSection } from "@/features/account";
import { useCurrentUser } from "@/features/auth";
import { colors } from "@/styles/tokens";

// Interim Profile tab until the web profile page (heatmap, history, goals, settings) is ported:
// who you're signed in as, sign out, and account deletion (which Google Play requires in-app).
export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user, error, loading } = useCurrentUser();

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, gap: 32 }}>
      {loading && <ActivityIndicator color={colors.accent} />}
      {error && <Text className="text-danger">{error}</Text>}
      {user && (
        <View className="flex-row items-center gap-3">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size={56} />
          <View className="min-w-0 flex-1">
            <Text className="text-xl font-bold" numberOfLines={1}>
              {user.name}
            </Text>
            <Text className="text-sm text-foregroundSecondary" numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </View>
      )}
      <Button variant="secondary" title="Sign out" onPress={() => signOut()} />
      <View className="h-px bg-surfaceBorder" />
      <DeleteAccountSection />
    </ScrollView>
  );
}
