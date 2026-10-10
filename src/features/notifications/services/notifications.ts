import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";

export function getUnreadNotificationCount(getToken: GetToken) {
  return apiFetch<{ count: number }>("/api/v1/notifications/unread-count", getToken);
}

export type NotificationType =
  | "comment"
  | "mention"
  | "reaction"
  | "check_in"
  | "missed_log"
  | "nudge"
  | "feedback"
  | "broadcast"
  | "weekly_recap"
  | "clan_message"
  | "reply"
  | "contract";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** A web path: /logs, /clans/:id, /clans/:id/chat, /members/:id… */
  url: string | null;
  checkInId: string | null;
  readAt: string | null;
  createdAt: string;
};

/** The bell's 30 latest, then all marked read (like opening the web bell); rows still show what was unread. */
export function openNotifications(getToken: GetToken) {
  return apiFetch<{ notifications: NotificationItem[] }>("/api/v1/notifications?markRead=1", getToken);
}
