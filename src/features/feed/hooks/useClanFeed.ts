import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";
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

export function useClanFeed(clanId: string | null) {
  const { getToken } = useAuth();
  const [sections, setSections] = useState<FeedSection[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!clanId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getFeed(getToken, { clanId, timezone });
      setSections(response.sections);
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [clanId, getToken]);

  const loadMore = useCallback(async () => {
    if (!clanId || !hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await getFeed(getToken, { clanId, timezone, before: nextCursor });
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

  return { sections, hasMore, loading, loadingMore, error, refresh, loadMore };
}
