import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";

/** Permanently deletes the signed-in user's account — see DELETE /api/v1/me in the web repo. */
export function deleteMyAccount(getToken: GetToken) {
  return apiFetch<void>("/api/v1/me", getToken, { method: "DELETE" });
}
