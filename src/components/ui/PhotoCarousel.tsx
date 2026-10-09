import { Image } from "expo-image";
import { useState } from "react";
import { ScrollView, View, type LayoutChangeEvent } from "react-native";
import { Text } from "./Text";

const MAX_WIDTH = 320; // the web carousel's max-w-xs
const HEIGHT = 240; // its max-h-60

/**
 * Port of the web PhotoCarousel: one photo shown as a single rounded, bordered image; several as a
 * swipeable strip with an "n/total" pill top-right and dot indicators (the active dot widened, in
 * accent) underneath.
 */
export function PhotoCarousel({ photos }: { photos: string[] }) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);
  if (photos.length === 0) return null;

  const onLayout = (event: LayoutChangeEvent) => setWidth(Math.min(event.nativeEvent.layout.width, MAX_WIDTH));

  if (photos.length === 1) {
    return (
      <View onLayout={onLayout} className="w-full">
        {width > 0 && (
          <Image source={{ uri: photos[0] }} contentFit="cover" style={{ width, height: HEIGHT, borderRadius: 8 }} className="border border-surfaceBorder" />
        )}
      </View>
    );
  }

  return (
    <View onLayout={onLayout} className="w-full gap-2">
      {width > 0 && (
        <View style={{ width }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => setActive(Math.round(event.nativeEvent.contentOffset.x / width))}
            className="overflow-hidden rounded-lg border border-surfaceBorder"
          >
            {photos.map((url) => (
              <Image key={url} source={{ uri: url }} contentFit="cover" style={{ width, height: HEIGHT }} />
            ))}
          </ScrollView>
          <View className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5">
            <Text className="text-xs font-semibold text-white">
              {active + 1}/{photos.length}
            </Text>
          </View>
        </View>
      )}
      <View className="flex-row justify-center gap-1" style={{ width: width || undefined }}>
        {photos.map((url, i) => (
          <View key={url} className={`h-1.5 rounded-full ${i === active ? "w-4 bg-accent" : "w-1.5 bg-foregroundMuted"}`} />
        ))}
      </View>
    </View>
  );
}
