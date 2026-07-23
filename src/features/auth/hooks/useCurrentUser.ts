import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";
import { getMe } from "../services/me";
import type { MeResponse } from "../types";

/**
 * Phase-0 spike: proves the Bearer-token auth chain end-to-end against /api/v1/me. Every later
 * feature's data-fetching hooks follow this same shape (getToken from useAuth(), pass to a
 * feature service, track loading/error state) rather than each hand-rolling it.
 */
export function useCurrentUser() {
  const { getToken } = useAuth();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await getMe(getToken);
      setUser(me);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, error, loading, refresh };
}
