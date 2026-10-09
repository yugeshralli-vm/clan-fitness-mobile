/**
 * Cross-feature fetch wrapper for the clan-fitness backend's /api/v1/** routes. Feature-level API
 * calls (e.g. src/features/auth/services/) call this rather than using fetch() directly, so the
 * Bearer-token attachment and base URL live in exactly one place.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is not set — check .env.");
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  getToken: (options?: { skipCache?: boolean }) => Promise<string | null>,
  init?: RequestInit,
): Promise<T> {
  const send = async (skipCache: boolean) => {
    const token = await getToken(skipCache ? { skipCache: true } : undefined);
    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
  };

  // Clerk session tokens live 60s and the SDK decides when to refresh by the device clock, so a
  // phone whose clock runs slow sends a token the server already considers expired. On a 401,
  // fetch a fresh token and retry once.
  let response = await send(false);
  if (response.status === 401) response = await send(true);

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body || response.statusText);
  }

  // 204 No Content (e.g. DELETE /api/v1/me) has no body to parse.
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
