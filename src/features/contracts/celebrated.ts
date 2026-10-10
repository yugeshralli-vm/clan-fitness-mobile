import * as SecureStore from "expo-secure-store";

// Claim ids already celebrated, persisted so reopening the board (a claim stays live-completed all
// day, until the nightly resolution) doesn't replay the same toast — the web keeps the same list
// in localStorage. SecureStore keys allow only letters, digits, ".", "-" and "_".
const key = (userId: string) => `contract-celebrated-claims_${userId}`;

export async function loadCelebrated(userId: string): Promise<Set<string>> {
  try {
    const raw = await SecureStore.getItemAsync(key(userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveCelebrated(userId: string, ids: Set<string>) {
  // Only today's claims matter; keep the list from growing forever.
  SecureStore.setItemAsync(key(userId), JSON.stringify([...ids].slice(-50))).catch(() => {});
}
