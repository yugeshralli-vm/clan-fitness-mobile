import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import type { FeedTarget } from "@/lib/feed-target";
import type { CommentWithUser } from "../types";

export function getComments(getToken: GetToken, target: FeedTarget, clanId: string) {
  const params = new URLSearchParams({ ...target, clanId });
  return apiFetch<{ comments: CommentWithUser[] }>(`/api/v1/comments?${params}`, getToken);
}

/** `text` may contain `@[Name](userId)` mention markup, like the web composer sends. */
export function addComment(getToken: GetToken, target: FeedTarget, clanId: string, text: string) {
  return apiFetch<{ comment: CommentWithUser }>("/api/v1/comments", getToken, {
    method: "POST",
    body: JSON.stringify({ ...target, clanId, text }),
  });
}

export function deleteComment(getToken: GetToken, commentId: string) {
  return apiFetch<void>(`/api/v1/comments/${encodeURIComponent(commentId)}`, getToken, { method: "DELETE" });
}
