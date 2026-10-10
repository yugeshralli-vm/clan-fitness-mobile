import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import type { ClanDetail, ClanMember, ClansResponse } from "../types";

export function getClans(getToken: GetToken) {
  return apiFetch<ClansResponse>("/api/v1/clans", getToken);
}

export function getClanMembers(getToken: GetToken, clanId: string) {
  return apiFetch<{ members: ClanMember[] }>(`/api/v1/members?clanId=${encodeURIComponent(clanId)}`, getToken);
}

const clanPath = (clanId: string) => `/api/v1/clans/${encodeURIComponent(clanId)}`;
const memberPath = (clanId: string, userId: string) => `${clanPath(clanId)}/members/${encodeURIComponent(userId)}`;

export function getClanDetail(getToken: GetToken, clanId: string) {
  return apiFetch<ClanDetail>(clanPath(clanId), getToken);
}

export function renameClan(getToken: GetToken, clanId: string, name: string) {
  return apiFetch<{ name: string }>(clanPath(clanId), getToken, { method: "PATCH", body: JSON.stringify({ name }) });
}

export function deleteClan(getToken: GetToken, clanId: string, confirmName: string) {
  return apiFetch<void>(clanPath(clanId), getToken, { method: "DELETE", body: JSON.stringify({ confirmName }) });
}

export function regenerateInviteCode(getToken: GetToken, clanId: string) {
  return apiFetch<{ inviteCode: string }>(`${clanPath(clanId)}/invite-code`, getToken, { method: "POST" });
}

export function leaveClan(getToken: GetToken, clanId: string) {
  return apiFetch<void>(`${clanPath(clanId)}/leave`, getToken, { method: "POST" });
}

export function removeMember(getToken: GetToken, clanId: string, userId: string) {
  return apiFetch<void>(memberPath(clanId, userId), getToken, { method: "DELETE" });
}

export function makeAdmin(getToken: GetToken, clanId: string, userId: string) {
  return apiFetch<{ transferred: true }>(`${memberPath(clanId, userId)}/admin`, getToken, { method: "POST" });
}

export function nudgeMember(getToken: GetToken, clanId: string, userId: string) {
  return apiFetch<{ sent: true }>(`${memberPath(clanId, userId)}/nudge`, getToken, { method: "POST" });
}
