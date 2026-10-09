import { apiFetch } from "@/services/api-client";

/** The server only ever raises today's count — see POST /api/v1/steps/sync in the web repo. */
export function syncSteps(getToken: () => Promise<string | null>, stepsCount: number, timezone: string) {
  return apiFetch<{ steps: number; updated: boolean }>("/api/v1/steps/sync", getToken, {
    method: "POST",
    body: JSON.stringify({ stepsCount, timezone }),
  });
}
