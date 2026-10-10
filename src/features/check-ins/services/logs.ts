import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch, apiUpload } from "@/services/api-client";
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

/** Uploads one (already compressed) photo; the returned URL goes in the next save's `photoUrls`. */
export function uploadFoodPhoto(getToken: GetToken, localUri: string) {
  const body = new FormData();
  // React Native's FormData takes a { uri, name, type } file reference.
  body.append("file", { uri: localUri, name: "food.jpg", type: "image/jpeg" } as unknown as Blob);
  return apiUpload<{ url: string }>("/api/v1/uploads/food-photo", getToken, body);
}
