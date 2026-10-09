import { ActivityIndicator, Pressable, RefreshControl, SectionList, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useActiveClan } from "@/features/clans";
import { colors } from "@/styles/tokens";
import { useClanFeed } from "../hooks/useClanFeed";
import { FeedCard } from "./FeedCard";
import { FeedSectionHeader } from "./FeedSectionHeader";

/**
 * Port of the web clan page (/clans/[clanId]): clan name, description and member count, then the
 * feed grouped by day — same 24px page padding and spacing as the web layout (px-6 py-8, 24px
 * between days, 12px between cards).
 */
export function FeedScreen() {
  const { activeClan, clans, loading: clanLoading, error: clanError } = useActiveClan();
  const { sections, hasMore, loading, loadingMore, error, refresh, loadMore } = useClanFeed(activeClan?.id ?? null);

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
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 }}
      sections={sections.map((section) => ({ ...section, data: section.cards }))}
      keyExtractor={(card) => card.cardId}
      renderItem={({ item }) => <FeedCard card={item} />}
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
