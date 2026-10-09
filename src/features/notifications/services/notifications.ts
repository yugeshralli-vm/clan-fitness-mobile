import { apiFetch } from "@/services/api-client";

export function getUnreadNotificationCount(getToken: () => Promise<string | null>) {
  return apiFetch<{ count: number }>("/api/v1/notifications/unread-count", getToken);
}
