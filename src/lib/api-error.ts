import { ApiError } from "@/services/api-client";

/** The message to show for a failed API call — the server's `{ error }` when it sent one. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;
  try {
    return JSON.parse(error.message).error ?? fallback;
  } catch {
    return fallback;
  }
}
