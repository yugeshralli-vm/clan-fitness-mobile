import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { useApiToken } from "@/hooks/useApiToken";
import type { RealtimeEvent } from "./events";
import { getRealtimeToken } from "./services/token";

// Ported from the web app's src/features/realtime/RealtimeProvider.tsx — same server, frames and
// hook API. Mobile difference: the socket closes when the app goes to the background and reopens
// (with a catch-up) when it returns, so battery isn't spent on an idle socket and "online" means
// the app is actually open.

const MAX_RECONNECT_DELAY_MS = 30_000;
/** Coalesces bursts (one check-in fans out to several clans + a notification each) into one refetch. */
const COALESCE_MS = 250;
/** How often the composer re-announces "still typing" — well under TYPING_VISIBLE_MS (same as web). */
const TYPING_SEND_INTERVAL_MS = 2500;
/** How long someone shows as typing after their last ping. */
const TYPING_VISIBLE_MS = 4000;

export type RealtimeFrame =
  | { type: "changed"; event: RealtimeEvent; clanId?: string; actor?: string; data?: unknown }
  | { type: "resync" };
type ChangedFrame = Extract<RealtimeFrame, { type: "changed" }>;
type Listener = (frame: RealtimeFrame) => void;
type TypingListener = (clanId: string, userId: string) => void;
type Status = "disabled" | "connecting" | "open";

type RealtimeContextValue = {
  status: Status;
  joinedClanIds: ReadonlySet<string>;
  /** clanId -> user ids with the app open right now. Absent while disconnected (unknown, not empty). */
  presence: ReadonlyMap<string, readonly string[]>;
  subscribe: (listener: Listener) => () => void;
  subscribeTyping: (listener: TypingListener) => () => void;
  sendTyping: (clanId: string) => void;
  /** Reconnect with a fresh token so it covers `clanId` — at most once per clan per session. */
  requestJoin: (clanId: string) => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

/** One WebSocket to the Railway signal server, shared by every subscriber via the hooks below. */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const getToken = useApiToken();
  const [status, setStatus] = useState<Status>("connecting");
  const [joinedClanIds, setJoinedClanIds] = useState<ReadonlySet<string>>(() => new Set());
  const [presence, setPresence] = useState<ReadonlyMap<string, readonly string[]>>(() => new Map());
  const listenersRef = useRef(new Set<Listener>());
  const typingListenersRef = useRef(new Set<TypingListener>());
  const reconnectRef = useRef<() => void>(() => {});
  const sendRef = useRef<(message: object) => void>(() => {});
  const joinRequestedRef = useRef(new Set<string>());

  useEffect(() => {
    let socket: WebSocket | null = null;
    let disposed = false;
    let connecting = false;
    let backgrounded = AppState.currentState !== "active";
    let attempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const emit = (frame: RealtimeFrame) => {
      for (const listener of listenersRef.current) listener(frame);
    };

    function scheduleReconnect() {
      if (disposed || backgrounded) return;
      const delay = Math.min(1000 * 2 ** attempts, MAX_RECONNECT_DELAY_MS);
      attempts += 1;
      reconnectTimer = setTimeout(connect, delay);
    }

    function closeSocket() {
      const old = socket;
      socket = null;
      old?.close();
      setPresence(new Map());
    }

    async function connect() {
      clearTimeout(reconnectTimer);
      if (disposed || backgrounded || connecting) return;
      connecting = true;
      setStatus("connecting");
      const auth = await getRealtimeToken(getToken).catch(() => null);
      connecting = false;
      if (disposed || backgrounded) return;
      if (auth === undefined) {
        setStatus("disabled"); // realtime isn't configured on the server
        return;
      }
      if (!auth) return scheduleReconnect();

      // String-built: React Native's URL doesn't implement the protocol/searchParams setters.
      const base = auth.url.replace(/^http/, "ws").replace(/\/+$/, "");
      const ws = new WebSocket(`${base}/?token=${encodeURIComponent(auth.token)}`);
      socket = ws;

      ws.onopen = () => {
        attempts = 0;
        setJoinedClanIds(new Set(auth.clanIds));
        setStatus("open");
      };
      ws.onmessage = (message) => {
        try {
          const frame = JSON.parse(String(message.data));
          if (frame?.type === "changed") emit(frame);
          else if (frame?.type === "presence") setPresence((prev) => new Map(prev).set(frame.clanId, frame.userIds));
          else if (frame?.type === "typing") for (const listener of typingListenersRef.current) listener(frame.clanId, frame.userId);
        } catch {
          // Ignore anything that isn't one of our frames.
        }
      };
      ws.onclose = () => {
        if (socket !== ws) return;
        socket = null;
        setPresence(new Map());
        if (disposed || backgrounded) return;
        setStatus("connecting");
        scheduleReconnect();
      };
    }

    sendRef.current = (message) => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
    };
    // Swaps the socket for one with a fresh token (e.g. a clan joined since the last one).
    reconnectRef.current = () => {
      closeSocket();
      attempts = 0;
      connect();
    };

    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        backgrounded = false;
        emit({ type: "resync" }); // anything could have changed while we were away
        attempts = 0;
        if (!socket) connect();
      } else if (state === "background") {
        backgrounded = true;
        clearTimeout(reconnectTimer);
        closeSocket();
        setStatus("connecting");
      }
    });

    connect();

    return () => {
      disposed = true;
      appState.remove();
      reconnectRef.current = () => {};
      sendRef.current = () => {};
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [getToken]);

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);
  const subscribeTyping = useCallback((listener: TypingListener) => {
    typingListenersRef.current.add(listener);
    return () => {
      typingListenersRef.current.delete(listener);
    };
  }, []);
  const sendTyping = useCallback((clanId: string) => sendRef.current({ type: "typing", clanId }), []);
  const requestJoin = useCallback((clanId: string) => {
    if (joinRequestedRef.current.has(clanId)) return;
    joinRequestedRef.current.add(clanId);
    reconnectRef.current();
  }, []);

  const value = useMemo<RealtimeContextValue>(
    () => ({ status, joinedClanIds, presence, subscribe, subscribeTyping, sendTyping, requestJoin }),
    [status, joinedClanIds, presence, subscribe, subscribeTyping, sendTyping, requestJoin],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

/**
 * Calls `onChange` when one of `events` happens — in `clanId` if given, otherwise anywhere the user
 * gets frames for. Also calls it after (re)connecting and when the app returns to the foreground,
 * since frames sent meanwhile were missed. Polls every `fallbackPollMs` while not live, if given.
 * Same contract as the web hook.
 */
export function useRealtime({
  events,
  clanId,
  fallbackPollMs,
  onChange,
}: {
  events: readonly RealtimeEvent[];
  clanId?: string;
  fallbackPollMs?: number;
  onChange: (frame?: ChangedFrame) => void;
}) {
  const ctx = useContext(RealtimeContext);
  const status = ctx?.status ?? "disabled";
  const live = status === "open" && (!clanId || ctx!.joinedClanIds.has(clanId));
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const eventsKey = events.join(",");
  const subscribe = ctx?.subscribe;

  useEffect(() => {
    if (!subscribe) return;
    const wanted = new Set(eventsKey.split(","));
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: ChangedFrame | undefined;
    const unsubscribe = subscribe((frame) => {
      if (frame.type === "changed") {
        if (!wanted.has(frame.event)) return;
        if (clanId && frame.clanId !== clanId) return;
        pending = frame;
      } else {
        pending = undefined;
      }
      if (timer) return;
      timer = setTimeout(() => {
        timer = undefined;
        onChangeRef.current(pending);
      }, COALESCE_MS);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [subscribe, clanId, eventsKey]);

  // Catch up whenever this subscriber goes live — frames sent while it wasn't were never seen.
  const wasLiveRef = useRef(live);
  useEffect(() => {
    if (live && !wasLiveRef.current) onChangeRef.current();
    wasLiveRef.current = live;
  }, [live]);

  useEffect(() => {
    if (live || !fallbackPollMs) return;
    const interval = setInterval(() => onChangeRef.current(), fallbackPollMs);
    return () => clearInterval(interval);
  }, [live, fallbackPollMs]);

  // The socket's token predates this clan (just joined it) — get one that covers it.
  const requestJoin = ctx?.requestJoin;
  const needsJoin = status === "open" && !!clanId && !live;
  useEffect(() => {
    if (needsJoin && clanId) requestJoin?.(clanId);
  }, [needsJoin, clanId, requestJoin]);
}

/** Whether `userId` has the app open, per presence in any of the viewer's clans. */
export function useIsOnline(userId: string): boolean {
  const ctx = useContext(RealtimeContext);
  if (!ctx) return false;
  for (const userIds of ctx.presence.values()) if (userIds.includes(userId)) return true;
  return false;
}

/** User ids in `clanId` with the app open right now, or null while that isn't known. */
export function usePresence(clanId: string): readonly string[] | null {
  return useContext(RealtimeContext)?.presence.get(clanId) ?? null;
}

/**
 * Who else is typing in `clanId`'s chat, plus `notifyTyping` to call on every keystroke (it
 * throttles itself). Someone drops off after TYPING_VISIBLE_MS without a ping, or as soon as their
 * message lands. Port of the web hook.
 */
export function useTypingIndicator(clanId: string | undefined, currentUserId: string | undefined) {
  const ctx = useContext(RealtimeContext);
  const [typing, setTyping] = useState<ReadonlyMap<string, number>>(() => new Map());
  const lastSentRef = useRef(0);
  const subscribeTyping = ctx?.subscribeTyping;
  const subscribe = ctx?.subscribe;
  const sendTyping = ctx?.sendTyping;

  useEffect(() => {
    if (!subscribeTyping || !subscribe || !clanId) return;
    const unsubscribeTyping = subscribeTyping((frameClanId, userId) => {
      if (frameClanId !== clanId || userId === currentUserId) return;
      setTyping((prev) => new Map(prev).set(userId, Date.now() + TYPING_VISIBLE_MS));
    });
    const unsubscribeChanges = subscribe((frame) => {
      if (frame.type !== "changed" || frame.event !== "chat_message" || frame.clanId !== clanId || !frame.actor) return;
      const actor = frame.actor;
      setTyping((prev) => {
        if (!prev.has(actor)) return prev;
        const next = new Map(prev);
        next.delete(actor);
        return next;
      });
    });
    return () => {
      unsubscribeTyping();
      unsubscribeChanges();
      setTyping(new Map());
    };
  }, [subscribeTyping, subscribe, clanId, currentUserId]);

  // Expire stale entries — scheduled for the soonest expiry rather than ticking on an interval.
  useEffect(() => {
    if (typing.size === 0) return;
    const soonest = Math.min(...typing.values());
    const timeout = setTimeout(
      () => setTyping((prev) => new Map([...prev].filter(([, expiresAt]) => expiresAt > Date.now()))),
      Math.max(0, soonest - Date.now()),
    );
    return () => clearTimeout(timeout);
  }, [typing]);

  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (!clanId || now - lastSentRef.current < TYPING_SEND_INTERVAL_MS) return;
    lastSentRef.current = now;
    sendTyping?.(clanId);
  }, [clanId, sendTyping]);

  /** Call after sending, so the next keystroke announces typing again right away. */
  const resetTyping = useCallback(() => {
    lastSentRef.current = 0;
  }, []);

  return { typingUserIds: [...typing.keys()], notifyTyping, resetTyping };
}
