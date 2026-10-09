import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import type { ClanMember, ClansResponse } from "../types";

export function getClans(getToken: GetToken) {
  return apiFetch<ClansResponse>("/api/v1/clans", getToken);
}

export function getClanMembers(getToken: GetToken, clanId: string) {
  return apiFetch<{ members: ClanMember[] }>(`/api/v1/members?clanId=${encodeURIComponent(clanId)}`, getToken);
}
