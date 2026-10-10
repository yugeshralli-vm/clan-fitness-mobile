import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import type { ClaimResponse, ContractsResponse } from "../types";

const contractsPath = (clanId: string) => `/api/v1/clans/${encodeURIComponent(clanId)}/contracts`;

export function getContracts(getToken: GetToken, clanId: string) {
  return apiFetch<ContractsResponse>(contractsPath(clanId), getToken);
}

export function claimContract(getToken: GetToken, clanId: string, contractId: string) {
  return apiFetch<ClaimResponse>(contractsPath(clanId), getToken, { method: "POST", body: JSON.stringify({ contractId }) });
}
