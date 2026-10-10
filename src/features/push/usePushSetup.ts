import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { useOpenNotificationUrl } from "@/features/notifications";
import { useApiToken } from "@/hooks/useApiToken";
import { enablePush, getPermission, isTurnedOff, markPrompted, wasPrompted } from "./services/push";

// While the app is open the bell updates live, but a banner still helps — same as the web, whose
// service worker shows pushes even with a tab open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }),
});

/**
 * Mounted once in the signed-in shell:
 * - keeps this phone registered while push is on (FCM tokens can rotate);
 * - asks for notification permission once on its own, like the web's first-visit prompt;
 * - opens the screen a tapped notification is about, including one that launched the app.
 */
export function usePushSetup() {
  const getToken = useApiToken();
  const openUrl = useOpenNotificationUrl();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    (async () => {
      const [permission, turnedOff, prompted] = await Promise.all([getPermission(), isTurnedOff(), wasPrompted()]);
      // Re-registered on every launch while on: cheap, and retries a registration that failed.
      if (permission === "granted" && !turnedOff) await enablePush(getToken);
      else if (permission === "undetermined" && !prompted) {
        markPrompted();
        await enablePush(getToken);
      }
    })().catch(() => {});

    const rotation = Notifications.addPushTokenListener(() => {
      isTurnedOff().then((turnedOff) => {
        if (!turnedOff) enablePush(getToken).catch(() => {});
      });
    });
    return () => rotation.remove();
  }, [getToken]);

  useEffect(() => {
    if (!lastResponse) return;
    const data = lastResponse.notification.request.content.data as { url?: string; checkInId?: string } | undefined;
    if (data?.url) openUrl(data.url, data.checkInId);
    // Handled — clear it so returning to the app doesn't re-open the same screen.
    Notifications.clearLastNotificationResponseAsync?.().catch(() => {});
  }, [lastResponse, openUrl]);
}
