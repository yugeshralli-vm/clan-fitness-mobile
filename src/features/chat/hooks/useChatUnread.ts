import { useCallback, useEffect, useState } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import { useRealtime } from "@/features/realtime";
import { getLatestMessageAt } from "../services/chat";
import { loadChatSeenAt, subscribeChatSeen } from "./chat-seen";

/**
 * Whether the active clan's chat has a message newer than when it was last opened — the Chat tab's
 * red dot, like the web BottomNav's. Others' messages light it live; your own never do.
 */
export function useChatUnread(clanId: string | undefined, currentUserId: string | undefined, chatOpen: boolean) {
  const getToken = useApiToken();
  const [latestAt, setLatestAt] = useState<{ clanId: string; at: number } | null>(null);
  const [seenAt, setSeenAt] = useState<{ clanId: string; at: number | null } | null>(null);

  const refreshLatest = useCallback(async () => {
    if (!clanId) return;
    try {
      const { latestMessageAt } = await getLatestMessageAt(getToken, clanId);
      setLatestAt(latestMessageAt ? { clanId, at: Date.parse(latestMessageAt) } : null);
    } catch {
      // Best effort: the dot just stays as it was.
    }
  }, [clanId, getToken]);

  useEffect(() => {
    refreshLatest();
  }, [refreshLatest]);

  useEffect(() => {
    if (!clanId) return;
    let cancelled = false;
    const load = () => loadChatSeenAt(clanId).then((at) => !cancelled && setSeenAt({ clanId, at }));
    load();
    const unsubscribe = subscribeChatSeen(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [clanId]);

  useRealtime({
    events: ["chat_message"],
    clanId,
    onChange: (frame) => {
      if (!clanId) return;
      // No frame: reconnected or back from the background — ask the server what was missed.
      if (!frame) return void refreshLatest();
      if (frame.actor !== currentUserId) setLatestAt({ clanId, at: Date.now() });
    },
  });

  if (chatOpen || !clanId || latestAt?.clanId !== clanId || seenAt?.clanId !== clanId) return false;
  return seenAt.at === null || seenAt.at < latestAt.at;
}
