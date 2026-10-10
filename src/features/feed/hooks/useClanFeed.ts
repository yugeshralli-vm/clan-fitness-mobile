import { useCallback, useEffect, useRef, useState } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import { getFeed } from "../services/feed";
import type { FeedSection } from "../types";

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// The API paginates by raw row, not by day — so a day's cards can legitimately continue across a
// page boundary. Merges the new page's first section into the last loaded section when their
// `day` matches, instead of showing the same day twice.
function mergeSections(existing: FeedSection[], incoming: FeedSection[]): FeedSection[] {
  if (incoming.length === 0) return existing;
  const last = existing[existing.length - 1];
  const first = incoming[0];
  if (last && last.day === first.day) {
    const merged = { ...last, cards: [...last.cards, ...first.cards] };
    return [...existing.slice(0, -1), merged, ...incoming.slice(1)];
  }
  return [...existing, ...incoming];
}

/**
 * Puts a freshly fetched first page in front of what's already loaded: the head's days replace
 * the old ones, older "load more" days the viewer pulled in are kept, and on the day where the two
 * meet, cards the head doesn't have are kept after the head's. Same idea as the web FeedList's
 * realtime merge.
 */
function mergeHead(existing: FeedSection[], head: FeedSection[]): FeedSection[] {
  if (head.length === 0) return existing;
  const oldestHeadDay = head[head.length - 1].day;
  const merged = head.map((section) => {
    if (section.day !== oldestHeadDay) return section;
    const old = existing.find((s) => s.day === section.day);
    if (!old) return section;
    const ids = new Set(section.cards.map((c) => c.cardId));
    return { ...section, cards: [...section.cards, ...old.cards.filter((c) => !ids.has(c.cardId))] };
  });
  return [...merged, ...existing.filter((s) => s.day < oldestHeadDay)];
}

export function useClanFeed(clanId: string | null) {
  const getToken = useApiToken();
  const [sections, setSections] = useState<FeedSection[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pages beyond the first that the viewer loaded — a live refresh must keep those.
  const extraPagesRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!clanId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getFeed(getToken, { clanId, timezone });
      extraPagesRef.current = 0;
      setSections(response.sections);
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [clanId, getToken]);

  /** A live update: no spinner, and older pages the viewer already loaded stay put. */
  const silentRefresh = useCallback(async () => {
    if (!clanId) return;
    try {
      const response = await getFeed(getToken, { clanId, timezone });
      if (extraPagesRef.current === 0) {
        setSections(response.sections);
        setHasMore(response.hasMore);
        setNextCursor(response.nextCursor);
      } else {
        setSections((prev) => mergeHead(prev, response.sections));
      }
    } catch {
      // Background refresh — the next event or a pull-to-refresh will catch up.
    }
  }, [clanId, getToken]);

  const loadMore = useCallback(async () => {
    if (!clanId || !hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await getFeed(getToken, { clanId, timezone, before: nextCursor });
      extraPagesRef.current += 1;
      setSections((prev) => mergeSections(prev, response.sections));
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoadingMore(false);
    }
  }, [clanId, getToken, hasMore, nextCursor, loadingMore]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sections, hasMore, loading, loadingMore, error, refresh, silentRefresh, loadMore };
}
