import { useAuth, useUser } from "@clerk/expo";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { DeleteAccountSection } from "@/features/account";
import { ProfileView } from "@/features/profile";

// Port of the web /profile page. Sign out and account deletion (which Google Play requires
// in-app) stay below it until the web's settings sheet is ported.
export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  if (!user) return null;

  return (
    <ProfileView
      userId={user.id}
      footer={
        <View className="gap-8 pt-2">
          <Button variant="secondary" title="Sign out" onPress={() => signOut()} />
          <View className="h-px bg-surfaceBorder" />
          <DeleteAccountSection />
        </View>
      }
    />
  );
}
