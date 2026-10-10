import { useUser } from "@clerk/expo";
import { ProfileView } from "@/features/profile";

/** Web /profile. */
export default function ProfileScreen() {
  const { user } = useUser();
  if (!user) return null;
  return <ProfileView userId={user.id} />;
}
