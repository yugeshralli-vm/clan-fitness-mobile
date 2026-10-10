import { Redirect, useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/expo";
import { ProfileView } from "@/features/profile";

/** A clanmate's profile (web /members/[userId]); your own redirects to the Profile tab, as on web. */
export default function MemberProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useUser();
  if (userId === user?.id) return <Redirect href="/profile" />;
  return <ProfileView userId={userId} />;
}
