import { useCallback, useEffect, useState } from "react";
import { useRealtime } from "@/features/realtime";
import { useApiToken } from "@/hooks/useApiToken";
import { getUnreadNotificationCount } from "../services/notifications";

export function useUnreadNotificationCount() {
  const getToken = useApiToken();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setCount((await getUnreadNotificationCount(getToken)).count);
    } catch {
      // A missing badge isn't worth an error state — the next refresh will try again.
    }
  }, [getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // The badge updates the moment a notification is created, like the web bell.
  useRealtime({ events: ["notifications"], onChange: refresh });

  return { count, refresh };
}
