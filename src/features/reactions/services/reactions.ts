import type { FeedTarget } from "@/lib/feed-target";
import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import type { ReactionCounts } from "../types";

export function toggleReaction(getToken: GetToken, target: FeedTarget, clanId: string, emoji: string) {
  return apiFetch<{ reactions: ReactionCounts }>("/api/v1/reactions", getToken, {
    method: "POST",
    body: JSON.stringify({ ...target, clanId, emoji }),
  });
}

/** With reactor names, for the long-press "who reacted" sheet. */
export function getReactions(getToken: GetToken, target: FeedTarget, clanId: string) {
  const params = new URLSearchParams({ ...target, clanId });
  return apiFetch<{ reactions: ReactionCounts }>(`/api/v1/reactions?${params}`, getToken);
}
