import { useEffect, useState } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import { getClanMembers } from "../services/clans";
import type { ClanMember } from "../types";

// Members change rarely; one fetch per clan per app session is plenty for mention suggestions.
const cache = new Map<string, ClanMember[]>();

/** The active clan's members (for @mention suggestions), fetched once per clan and cached. */
export function useClanMembers(clanId: string | null | undefined) {
  const getToken = useApiToken();
  const [members, setMembers] = useState<ClanMember[]>(() => (clanId ? (cache.get(clanId) ?? []) : []));

  useEffect(() => {
    if (!clanId) return;
    const cached = cache.get(clanId);
    if (cached) {
      setMembers(cached);
      return;
    }
    let cancelled = false;
    getClanMembers(getToken, clanId)
      .then(({ members: fetched }) => {
        cache.set(clanId, fetched);
        if (!cancelled) setMembers(fetched);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [clanId, getToken]);

  return members;
}
