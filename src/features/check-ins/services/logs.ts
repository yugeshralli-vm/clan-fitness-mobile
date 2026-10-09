import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import type { LogCheckInRequest, LogsResponse } from "../types";

export function getLogs(getToken: GetToken, timezone: string) {
  return apiFetch<LogsResponse>(`/api/v1/logs?timezone=${encodeURIComponent(timezone)}`, getToken);
}

export function saveLogs(getToken: GetToken, input: LogCheckInRequest) {
  return apiFetch<LogsResponse>("/api/v1/logs", getToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
