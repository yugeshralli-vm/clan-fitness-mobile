import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, SectionList, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useActiveClan } from "@/features/clans";
import { useRealtime } from "@/features/realtime";
import { colors } from "@/styles/tokens";
import { useClanFeed, withSystemPosts } from "../hooks/useClanFeed";
import { FeedCard } from "./FeedCard";
import type { FeedItem } from "../types";
import { FeedSectionHeader } from "./FeedSectionHeader";
import { SystemPostCard } from "./SystemPostCard";

/**
 * Port of the web clan page (/clans/[clanId]): clan name, description and member count, then the
 * feed grouped by day — same 24px page padding and spacing as the web layout (px-6 py-8, 24px
 * between days, 12px between cards).
 */
export function FeedScreen() {
  const { activeClan, clans, loading: clanLoading, error: clanError } = useActiveClan();
  const { sections, systemPosts, hasMore, loading, loadingMore, error, refresh, silentRefresh, loadMore } = useClanFeed(activeClan?.id ?? null);
  // New check-ins, edits, comments and reactions from clanmates appear without a pull-to-refresh.
  useRealtime({ events: ["feed_post", "feed_engagement"], clanId: activeClan?.id, onChange: silentRefresh });

  const displaySections = useMemo(() => withSystemPosts(sections, systemPosts, !hasMore), [sections, systemPosts, hasMore]);

  // Opened from a notification (?checkIn=): scroll to that card and highlight it for 2s, like the
  // web. Only within what's loaded — the first page covers recent activity, which is what
  // notifications are about.
  const { checkIn } = useLocalSearchParams<{ checkIn?: string }>();
  const router = useRouter();
  const listRef = useRef<SectionList>(null);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  useEffect(() => {
    if (!checkIn || loading) return;
    router.setParams({ checkIn: undefined });
    const isTarget = (item: FeedItem) => item.kind === "card" && item.card.cardId === checkIn;
    const sectionIndex = displaySections.findIndex((section) => section.items.some(isTarget));
    if (sectionIndex === -1) return;
    const itemIndex = displaySections[sectionIndex].items.findIndex(isTarget);
    setHighlightedCardId(checkIn);
    // After layout, so the target row has been measured.
    requestAnimationFrame(() => listRef.current?.scrollToLocation({ sectionIndex, itemIndex, viewPosition: 0.5 }));
  }, [checkIn, loading, displaySections, router]);
  useEffect(() => {
    if (!highlightedCardId) return;
    const timeout = setTimeout(() => setHighlightedCardId(null), 2000);
    return () => clearTimeout(timeout);
  }, [highlightedCardId]);

  if (clanLoading && !activeClan) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (clanError) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-danger">{clanError}</Text>
      </View>
    );
  }
  if (!activeClan || clans.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-foregroundTertiary">Join a clan to see its feed.</Text>
      </View>
    );
  }

  return (
    <SectionList
      ref={listRef}
      onScrollToIndexFailed={() => {}}
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 }}
      sections={displaySections.map((section) => ({ ...section, data: section.items }))}
      keyExtractor={(item) => (item.kind === "card" ? item.card.cardId : item.post.id)}
      renderItem={({ item }) =>
        item.kind === "card" ? (
          <FeedCard card={item.card} clanId={activeClan.id} highlighted={item.card.cardId === highlightedCardId} />
        ) : (
          <SystemPostCard post={item.post} clanId={activeClan.id} />
        )
      }
      renderSectionHeader={({ section }) => <FeedSectionHeader dayLabel={section.dayLabel} />}
      ItemSeparatorComponent={() => <View className="h-3" />}
      renderSectionFooter={() => <View className="h-6" />}
      stickySectionHeadersEnabled={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.accent} colors={[colors.accent]} />}
      ListHeaderComponent={
        <View className="mb-6">
          <Text className="text-2xl font-bold">{activeClan.name}</Text>
          {activeClan.description ? <Text className="text-foregroundSecondary">{activeClan.description}</Text> : null}
          <Text className="text-sm text-foregroundTertiary">
            {activeClan.memberCount}/{activeClan.maxSize} members
          </Text>
          {error && <Text className="mt-2 text-sm text-danger">{error}</Text>}
        </View>
      }
      ListEmptyComponent={
        !loading ? (
          <View className="items-center gap-3 rounded-xl border border-dashed border-surfaceBorder py-10">
            <Text className="text-sm text-foregroundSecondary">No check-ins yet. Someone&apos;s got to go first 👀</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        hasMore ? (
          <Pressable onPress={loadMore} disabled={loadingMore} className="mt-6 min-h-11 items-center justify-center self-center px-4">
            <Text className="text-sm font-semibold text-accent">{loadingMore ? "Loading..." : "Load more"}</Text>
          </Pressable>
        ) : null
      }
    />
  );
}
