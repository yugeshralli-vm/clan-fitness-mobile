import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import type { FeedResponse } from "../types";

export function getFeed(
  getToken: GetToken,
  { clanId, before, timezone }: { clanId: string; before?: string; timezone: string },
) {
  const params = new URLSearchParams({ clanId, timezone });
  if (before) params.set("before", before);
  return apiFetch<FeedResponse>(`/api/v1/feed?${params.toString()}`, getToken);
}
