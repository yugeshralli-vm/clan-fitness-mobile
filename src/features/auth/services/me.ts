import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import type { MeResponse } from "../types";

export function getMe(getToken: GetToken) {
  return apiFetch<MeResponse>("/api/v1/me", getToken);
}
