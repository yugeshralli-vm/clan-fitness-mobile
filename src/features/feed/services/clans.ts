import { apiFetch } from "@/services/api-client";
import type { ClansResponse } from "../types";

// Lives here (not its own features/clans) since Phase 1 has no other clan-management surface —
// move to a proper features/clans folder once Phase 3 (clan management) needs one.
export function getClans(getToken: () => Promise<string | null>) {
  return apiFetch<ClansResponse>("/api/v1/clans", getToken);
}
