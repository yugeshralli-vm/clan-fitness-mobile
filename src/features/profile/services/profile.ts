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

export function saveGoals(getToken: GetToken, gymDaysPerWeek: number, stepsPerDay: number) {
  return apiFetch<{ goals: { gymDaysPerWeek: number; stepsPerDay: number } }>("/api/v1/me/goals", getToken, {
    method: "PUT",
    body: JSON.stringify({ gymDaysPerWeek, stepsPerDay }),
  });
}

export type ProfileDetailsInput = {
  unitsPreference: "metric" | "imperial";
  height: number | null;
  weight: number | null;
  dateOfBirth: string | null;
  gender: string | null;
  bio: string | null;
};

export function saveDetails(getToken: GetToken, details: ProfileDetailsInput) {
  return apiFetch<{ saved: true }>("/api/v1/me/details", getToken, { method: "PUT", body: JSON.stringify(details) });
}

export function savePreferences(getToken: GetToken, preferences: NonNullable<ProfileResponse["notificationPreferences"]>) {
  return apiFetch<unknown>("/api/v1/me/notification-preferences", getToken, { method: "PUT", body: JSON.stringify(preferences) });
}
