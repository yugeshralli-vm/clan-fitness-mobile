import * as SecureStore from "expo-secure-store";

// When each clan's chat was last looked at — the native counterpart of the web's
// `clan-chat-seen:<clanId>` localStorage entry. Kept in memory for the tab's dot, persisted so it
// survives restarts. (SecureStore keys allow only letters, digits, ".", "-" and "_".)
const seen = new Map<string, number>();
const listeners = new Set<() => void>();

function storageKey(clanId: string) {
  return `clan-chat-seen_${clanId}`;
}

export async function loadChatSeenAt(clanId: string): Promise<number | null> {
  if (seen.has(clanId)) return seen.get(clanId)!;
  const stored = await SecureStore.getItemAsync(storageKey(clanId)).catch(() => null);
  const at = stored ? Number(stored) : null;
  if (at && !seen.has(clanId)) seen.set(clanId, at);
  return seen.get(clanId) ?? null;
}

/**
 * `newestMessageAt` (server time) guards against a phone clock running behind the server's, which
 * would otherwise leave the newest message looking unseen right after reading it.
 */
export function markChatSeen(clanId: string, newestMessageAt?: number) {
  const at = Math.max(Date.now(), newestMessageAt ?? 0);
  seen.set(clanId, at);
  SecureStore.setItemAsync(storageKey(clanId), String(at)).catch(() => {});
  for (const listener of listeners) listener();
}

export function subscribeChatSeen(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
