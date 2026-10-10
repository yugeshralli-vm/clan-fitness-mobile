import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import type { ClanMessage, MessageReactions } from "../types";

export function getMessages(getToken: GetToken, clanId: string) {
  return apiFetch<{ messages: ClanMessage[] }>(`/api/v1/chat?${new URLSearchParams({ clanId })}`, getToken);
}

/** `body` may contain `@[Name](userId)` mention markup, like the web composer sends. */
export function sendMessage(getToken: GetToken, clanId: string, body: string, replyToMessageId: string | null) {
  return apiFetch<{ sent: true }>("/api/v1/chat", getToken, {
    method: "POST",
    body: JSON.stringify({ clanId, body, replyToMessageId }),
  });
}

export function toggleMessageReaction(getToken: GetToken, messageId: string, clanId: string, emoji: string) {
  return apiFetch<{ reactions: MessageReactions }>("/api/v1/chat/reactions", getToken, {
    method: "POST",
    body: JSON.stringify({ messageId, clanId, emoji }),
  });
}

export function getLatestMessageAt(getToken: GetToken, clanId: string) {
  return apiFetch<{ latestMessageAt: string | null }>(`/api/v1/chat/latest?${new URLSearchParams({ clanId })}`, getToken);
}
