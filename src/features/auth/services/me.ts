import { apiFetch } from "@/services/api-client";
import type { MeResponse } from "../types";

export function getMe(getToken: () => Promise<string | null>) {
  return apiFetch<MeResponse>("/api/v1/me", getToken);
}
