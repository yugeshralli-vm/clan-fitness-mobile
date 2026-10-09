import { useAuth } from "@clerk/expo";
import { useCallback, useState } from "react";
import { saveLogs } from "../services/logs";
import type { LogCheckInRequest, LogsResponse } from "../types";

export function useSaveLog(onSaved: (logs: LogsResponse) => void) {
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (input: LogCheckInRequest) => {
      setSaving(true);
      setError(null);
      try {
        const response = await saveLogs(getToken, input);
        onSaved(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      } finally {
        setSaving(false);
      }
    },
    [getToken, onSaved],
  );

  return { save, saving, error };
}
