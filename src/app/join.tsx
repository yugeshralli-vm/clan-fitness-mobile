import { useAuth } from "@clerk/expo";
import { Redirect, useLocalSearchParams } from "expo-router";
import { setPendingInvite } from "@/lib/pending-invite";

/**
 * Invite links (https://www.clanfitness.in/join?code=…) open here when the app is installed
 * (Android App Links). Signed in: straight to Join a clan with the code filled in. Signed out: the
 * code waits while you sign in, then the app picks it up.
 */
export default function JoinLink() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;

  if (isSignedIn) return <Redirect href={code ? { pathname: "/clans/join", params: { code } } : "/clans/join"} />;
  if (code) setPendingInvite(code);
  return <Redirect href="/sign-in" />;
}
