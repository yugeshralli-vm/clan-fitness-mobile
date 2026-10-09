import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import {
  getHealthConnectStatus,
  readTodaysSteps,
  requestStepsPermission,
  type HealthConnectStatus,
} from "./services/health-connect";

/** Automatic re-reads at most this often; "Refresh" ignores it. */
const AUTO_READ_INTERVAL_MS = 60 * 1000;

type HealthStepsContextValue = {
  status: HealthConnectStatus | "checking";
  /** Today's steps as Health Connect reports them, or null until read. */
  steps: number | null;
  readAt: number | null;
  reading: boolean;
  connect: () => Promise<void>;
  refresh: () => Promise<void>;
};

const HealthStepsContext = createContext<HealthStepsContextValue | null>(null);

/**
 * Reads today's steps from Health Connect — on launch, on returning to the foreground (at most once
 * a minute) and on "Refresh". Read-only by design: it never logs anything. The Log screen offers
 * the number in its Steps field, and nothing reaches the server or the clan feed until the user
 * taps Save themselves.
 */
export function HealthStepsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<HealthStepsContextValue["status"]>("checking");
  const [steps, setSteps] = useState<number | null>(null);
  const [readAt, setReadAt] = useState<number | null>(null);
  const [reading, setReading] = useState(false);
  const inFlight = useRef(false);
  const lastAutoRead = useRef(0);

  const read = useCallback(async (manual: boolean) => {
    if (inFlight.current) return;
    if (!manual && Date.now() - lastAutoRead.current < AUTO_READ_INTERVAL_MS) return;
    inFlight.current = true;
    lastAutoRead.current = Date.now();
    try {
      const current = await getHealthConnectStatus().catch(() => "unavailable" as const);
      setStatus(current);
      if (current !== "ready") return;
      setReading(true);
      setSteps(await readTodaysSteps());
      setReadAt(Date.now());
    } catch {
      // Best effort: the next foreground or "Refresh" tries again.
    } finally {
      inFlight.current = false;
      setReading(false);
    }
  }, []);

  useEffect(() => {
    read(false);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") read(false);
    });
    return () => subscription.remove();
  }, [read]);

  const connect = useCallback(async () => {
    const granted = await requestStepsPermission().catch(() => false);
    setStatus(granted ? "ready" : "needs-permission");
    if (granted) await read(true);
  }, [read]);

  const refresh = useCallback(() => read(true), [read]);

  return (
    <HealthStepsContext.Provider value={{ status, steps, readAt, reading, connect, refresh }}>
      {children}
    </HealthStepsContext.Provider>
  );
}

export function useHealthSteps() {
  const ctx = useContext(HealthStepsContext);
  if (!ctx) throw new Error("useHealthSteps must be used inside HealthStepsProvider");
  return ctx;
}
