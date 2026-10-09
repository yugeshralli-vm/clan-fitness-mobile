import { ActivityIndicator, RefreshControl, SectionList, Text, View } from "react-native";
import { useActiveClanId } from "../hooks/useActiveClanId";
import { useClanFeed } from "../hooks/useClanFeed";
import { FeedCard } from "./FeedCard";
import { FeedSectionHeader } from "./FeedSectionHeader";

export function FeedScreen() {
  const { clanId, hasNoClans, error: clanError, loading: clanLoading } = useActiveClanId();
  const { sections, loading, loadingMore, error, refresh, loadMore } = useClanFeed(clanId);

  if (clanLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (clanError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-danger">{clanError}</Text>
      </View>
    );
  }

  if (hasNoClans) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-foregroundTertiary">Join a clan to see its feed.</Text>
      </View>
    );
  }

  return (
    <SectionList
      className="flex-1 bg-background"
      sections={sections.map((section) => ({ ...section, data: section.cards }))}
      keyExtractor={(card) => card.cardId}
      renderItem={({ item }) => <FeedCard card={item} />}
      renderSectionHeader={({ section }) => <FeedSectionHeader dayLabel={section.dayLabel} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      stickySectionHeadersEnabled={false}
      ListEmptyComponent={
        !loading ? (
          <View className="items-center px-6 py-12">
            <Text className="text-foregroundTertiary">No check-ins yet — be the first to log today.</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        loadingMore ? (
          <View className="py-4">
            <ActivityIndicator />
          </View>
        ) : null
      }
      ListHeaderComponent={
        error ? (
          <View className="px-4 pt-4">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        ) : null
      }
    />
  );
}
