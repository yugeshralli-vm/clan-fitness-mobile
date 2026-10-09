import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";

export function getUnreadNotificationCount(getToken: GetToken) {
  return apiFetch<{ count: number }>("/api/v1/notifications/unread-count", getToken);
}
