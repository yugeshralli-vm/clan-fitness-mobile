import { useCallback, useEffect, useRef, useState } from "react";
import { useApiToken } from "@/hooks/useApiToken";
import { getFeed } from "../services/feed";
import type { FeedItem, FeedSection, SystemPost } from "../types";

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

/**
 * The web's mergeFeedCards for the app: weekly recaps go into their day's section (a new section
 * if that day has no check-ins), ordered by time with the cards, newest first. Only recaps no older
 * than the oldest loaded day are placed, so an old recap waits for "Load more" to reach its day
 * instead of sitting out of order at the bottom.
 */
export function withSystemPosts(sections: FeedSection[], posts: SystemPost[], allLoaded: boolean) {
  const oldestDay = sections[sections.length - 1]?.day;
  const placeable = posts.filter((post) => allLoaded || !oldestDay || post.day >= oldestDay);
  const days = [...new Set([...sections.map((s) => s.day), ...placeable.map((p) => p.day)])].sort().reverse();
  return days.map((day) => {
    const section = sections.find((s) => s.day === day);
    const items: (FeedItem & { at: string })[] = [
      ...(section?.cards ?? []).map((card) => ({ kind: "card" as const, card, at: card.latestAt })),
      ...placeable.filter((p) => p.day === day).map((post) => ({ kind: "systemPost" as const, post, at: post.createdAt })),
    ].sort((a, b) => b.at.localeCompare(a.at));
    return {
      day,
      dayLabel: section?.dayLabel ?? placeable.find((p) => p.day === day)!.dayLabel,
      items: items.map(({ at: _at, ...item }) => item as FeedItem),
    };
  });
}

export function useClanFeed(clanId: string | null) {
  const getToken = useApiToken();
  const [sections, setSections] = useState<FeedSection[]>([]);
  const [systemPosts, setSystemPosts] = useState<SystemPost[]>([]);
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
      setSystemPosts(response.systemPosts ?? []);
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
      setSystemPosts(response.systemPosts ?? []);
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

  return { sections, systemPosts, hasMore, loading, loadingMore, error, refresh, silentRefresh, loadMore };
}
