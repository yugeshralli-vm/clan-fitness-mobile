import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";

/** Undefined (204) when the server has no realtime configured — the app then just doesn't connect. */
export function getRealtimeToken(getToken: GetToken) {
  return apiFetch<{ token: string; clanIds: string[]; url: string } | undefined>("/api/v1/realtime/token", getToken);
}
