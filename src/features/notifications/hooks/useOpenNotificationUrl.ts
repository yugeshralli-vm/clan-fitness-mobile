import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useActiveClan } from "@/features/clans";
import { useOpenProfile } from "@/features/profile";

/**
 * Follows a notification's web path to the matching app screen: a clan's feed, chat or page (made
 * the active clan first), the Log tab, or a profile. Unknown paths do nothing.
 */
export function useOpenNotificationUrl() {
  const router = useRouter();
  const openProfile = useOpenProfile();
  const { clans, setActiveClanId } = useActiveClan();

  return useCallback(
    (url: string | null) => {
      if (!url) return;
      const path = url.split("?")[0];
      if (path === "/logs") return router.navigate("/log");
      if (path === "/profile") return router.navigate("/profile");

      const member = path.match(/^\/members\/([^/]+)$/);
      if (member) return openProfile(member[1]);

      const clan = path.match(/^\/clans\/([^/]+)(?:\/(chat|manage|contracts|welcome))?$/);
      if (clan) {
        // Only a clan you're still in — one you've left would just fall back to your first clan.
        if (clans.some((c) => c.id === clan[1])) setActiveClanId(clan[1]);
        const page = clan[2];
        if (page === "chat") return router.navigate("/chat");
        if (page === "manage" || page === "contracts") return router.navigate("/clan");
        return router.navigate("/");
      }
    },
    [router, openProfile, clans, setActiveClanId],
  );
}
