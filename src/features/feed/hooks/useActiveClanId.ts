import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";
import { getClans } from "../services/clans";

/**
 * No clan switcher exists yet (Phase 3) — defaults to the user's first clan, same fallback the
 * web app itself uses (src/lib/active-clan.ts's resolveActiveClanId) when nothing else is set.
 */
export function useActiveClanId() {
  const { getToken } = useAuth();
  const [clanId, setClanId] = useState<string | null>(null);
  const [hasNoClans, setHasNoClans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { clans } = await getClans(getToken);
      setClanId(clans[0]?.id ?? null);
      setHasNoClans(clans.length === 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { clanId, hasNoClans, error, loading };
}
