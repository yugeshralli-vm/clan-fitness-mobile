import { useCallback, useEffect, useState } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import { getLogs } from "../services/logs";
import type { LogsResponse } from "../types";

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function useTodaysLogs() {
  const getToken = useApiToken();
  const [logs, setLogs] = useState<LogsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLogs(getToken, timezone);
      setLogs(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { logs, setLogs, error, loading, refresh, timezone };
}
