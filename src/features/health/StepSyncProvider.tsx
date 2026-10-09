import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { useApiToken } from "@/hooks/useApiToken";
import {
  getHealthConnectStatus,
  readTodaysSteps,
  requestStepsPermission,
  type HealthConnectStatus,
} from "./services/health-connect";
import { syncSteps } from "./services/steps-sync";

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const LAST_SYNC_KEY = "steps-last-sync";
/** Automatic syncs at most this often; "Sync now" ignores it. */
const AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000;
/**
 * The first automatic sync of a day waits for a real number of steps. The first steps log of the
 * day notifies the whole clan ("X checked in"), and that shouldn't fire for 40 steps taken walking
 * to the bathroom. Tapping "Sync now" posts any amount.
 */
const FIRST_AUTO_SYNC_MIN_STEPS = 1000;

type LastSync = { day: string; steps: number; at: number };

type StepSyncContextValue = {
  status: HealthConnectStatus | "checking";
  lastSync: LastSync | null;
  syncing: boolean;
  /** Bumps whenever a sync changed today's log on the server, so open screens can refetch. */
  syncedVersion: number;
  connect: () => Promise<void>;
  syncNow: () => Promise<void>;
};

const StepSyncContext = createContext<StepSyncContextValue | null>(null);

function todayKey() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in the device's timezone
}

/**
 * Keeps today's steps in sync from Health Connect: on launch, whenever the app comes back to the
 * foreground (at most every 5 minutes), and on "Sync now". Only posts when Health Connect has more
 * steps than last synced; the server additionally never lowers a count someone typed in by hand.
 */
export function StepSyncProvider({ children }: { children: ReactNode }) {
  const getToken = useApiToken();
  const [status, setStatus] = useState<StepSyncContextValue["status"]>("checking");
  const [lastSync, setLastSync] = useState<LastSync | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncedVersion, setSyncedVersion] = useState(0);
  const inFlight = useRef(false);
  const lastAutoAttempt = useRef(0);

  const run = useCallback(
    async (manual: boolean) => {
      if (inFlight.current) return;
      if (!manual && Date.now() - lastAutoAttempt.current < AUTO_SYNC_INTERVAL_MS) return;
      inFlight.current = true;
      lastAutoAttempt.current = Date.now();
      try {
        const current = await getHealthConnectStatus().catch(() => "unavailable" as const);
        setStatus(current);
        if (current !== "ready") return;

        setSyncing(true);
        const day = todayKey();
        const stored = await SecureStore.getItemAsync(LAST_SYNC_KEY).catch(() => null);
        const previous: LastSync | null = stored ? JSON.parse(stored) : null;
        const previousToday = previous?.day === day ? previous : null;
        const steps = await readTodaysSteps();

        const isNewHigh = steps > (previousToday?.steps ?? 0);
        const meetsFirstSyncBar = previousToday !== null || steps >= FIRST_AUTO_SYNC_MIN_STEPS;
        if (!manual && (!isNewHigh || !meetsFirstSyncBar)) {
          setLastSync(previousToday);
          return;
        }

        const result = await syncSteps(getToken, steps, timezone);
        const next = { day, steps: result.steps, at: Date.now() };
        await SecureStore.setItemAsync(LAST_SYNC_KEY, JSON.stringify(next)).catch(() => {});
        setLastSync(next);
        if (result.updated) setSyncedVersion((v) => v + 1);
      } catch {
        // Best effort: the next foreground or "Sync now" retries.
      } finally {
        inFlight.current = false;
        setSyncing(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    run(false);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") run(false);
    });
    return () => subscription.remove();
  }, [run]);

  const connect = useCallback(async () => {
    const granted = await requestStepsPermission().catch(() => false);
    setStatus(granted ? "ready" : "needs-permission");
    if (granted) await run(true);
  }, [run]);

  const syncNow = useCallback(() => run(true), [run]);

  return (
    <StepSyncContext.Provider value={{ status, lastSync, syncing, syncedVersion, connect, syncNow }}>
      {children}
    </StepSyncContext.Provider>
  );
}

export function useStepSync() {
  const ctx = useContext(StepSyncContext);
  if (!ctx) throw new Error("useStepSync must be used inside StepSyncProvider");
  return ctx;
}
