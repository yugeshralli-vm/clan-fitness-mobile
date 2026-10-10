import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useCallback } from "react";

/** Opens someone's profile — your own goes to the Profile tab, as the web redirects /members/<you> to /profile. */
export function useOpenProfile() {
  const router = useRouter();
  const { user } = useUser();
  return useCallback(
    (userId: string) => {
      if (userId === user?.id) router.navigate("/profile");
      else router.push({ pathname: "/members/[userId]", params: { userId } });
    },
    [router, user?.id],
  );
}
