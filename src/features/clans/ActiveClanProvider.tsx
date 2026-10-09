import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import { getClans } from "./services/clans";
import type { Clan } from "./types";

const ACTIVE_CLAN_KEY = "active-clan-id";

type ActiveClanContextValue = {
  clans: Clan[];
  activeClan: Clan | null;
  setActiveClanId: (clanId: string) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const ActiveClanContext = createContext<ActiveClanContextValue | null>(null);

/**
 * The user's clans and which one is active — shared by the header's clan switcher and every
 * clan-scoped tab, like the web app's active clan (src/lib/active-clan.ts). The choice is
 * remembered across launches; it falls back to the first clan, same as web.
 */
export function ActiveClanProvider({ children }: { children: ReactNode }) {
  const getToken = useApiToken();
  const [clans, setClans] = useState<Clan[]>([]);
  const [activeClanId, setActiveClanIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ clans: fetched }, stored] = await Promise.all([
        getClans(getToken),
        SecureStore.getItemAsync(ACTIVE_CLAN_KEY).catch(() => null),
      ]);
      setClans(fetched);
      setActiveClanIdState((current) => {
        const preferred = current ?? stored;
        return fetched.some((c) => c.id === preferred) ? preferred : (fetched[0]?.id ?? null);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setActiveClanId = useCallback((clanId: string) => {
    setActiveClanIdState(clanId);
    SecureStore.setItemAsync(ACTIVE_CLAN_KEY, clanId).catch(() => {});
  }, []);

  const activeClan = clans.find((c) => c.id === activeClanId) ?? null;

  return (
    <ActiveClanContext.Provider value={{ clans, activeClan, setActiveClanId, loading, error, refresh }}>
      {children}
    </ActiveClanContext.Provider>
  );
}

export function useActiveClan() {
  const ctx = useContext(ActiveClanContext);
  if (!ctx) throw new Error("useActiveClan must be used inside ActiveClanProvider");
  return ctx;
}
