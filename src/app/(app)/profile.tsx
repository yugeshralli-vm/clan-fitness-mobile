import { useAuth } from "@clerk/expo";
import { useCurrentUser } from "@/features/auth";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

// Phase-0 spike screen: proves the Bearer-token auth chain end-to-end by rendering the real
// /api/v1/me response, not a placeholder. Every later feature's real screen replaces its own
// "coming soon" tab the same way this one already does for Profile.
export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user, error, loading, refresh } = useCurrentUser();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
      {loading && <ActivityIndicator color="#3bffad" />}
      {error && <Text className="text-center text-danger">{error}</Text>}
      {user && (
        <>
          {user.avatarUrl && (
            <Image source={{ uri: user.avatarUrl }} className="h-20 w-20 rounded-full" />
          )}
          <Text className="text-xl font-bold text-foreground">{user.name}</Text>
          <Text className="text-foregroundSecondary">{user.email}</Text>
        </>
      )}
      <Pressable onPress={refresh} className="rounded-lg border border-surfaceBorder px-4 py-2">
        <Text className="text-foreground">Refresh</Text>
      </Pressable>
      <Pressable onPress={() => signOut()} className="rounded-lg bg-danger px-4 py-2">
        <Text className="font-bold text-white">Sign out</Text>
      </Pressable>
    </View>
  );
}
