import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import type { CheckInType, HistoryPage, HistoryRange, ProfileResponse } from "../types";

const userPath = (userId: string) => `/api/v1/users/${encodeURIComponent(userId)}`;

export function getProfile(getToken: GetToken, userId: string) {
  return apiFetch<ProfileResponse>(userPath(userId), getToken);
}

export function getHistory(getToken: GetToken, userId: string, type: CheckInType | "all", range: HistoryRange, before?: string) {
  const params = new URLSearchParams({ type, range });
  if (before) params.set("before", before);
  return apiFetch<HistoryPage>(`${userPath(userId)}/history?${params}`, getToken);
}
