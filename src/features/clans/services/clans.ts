import { apiFetch } from "@/services/api-client";
import type { ClansResponse } from "../types";

export function getClans(getToken: () => Promise<string | null>) {
  return apiFetch<ClansResponse>("/api/v1/clans", getToken);
}
