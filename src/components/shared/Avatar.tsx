import { Image } from "expo-image";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";

/**
 * Port of the web Avatar: round image, or the first initial on the background color. `online`
 * adds the web's green presence dot (bottom-right, min 8px, ringed in the surface color).
 */
export function Avatar({
  name,
  avatarUrl,
  size = 32,
  online,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
  online?: boolean;
}) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  const avatar = avatarUrl ? (
    <Image source={{ uri: avatarUrl }} style={style} />
  ) : (
    <View style={style} className="items-center justify-center bg-background">
      <Text className="text-xs font-semibold text-foregroundSecondary">{name.trim().charAt(0).toUpperCase() || "?"}</Text>
    </View>
  );
  if (!online) return avatar;
  const dot = Math.max(8, Math.round(size * 0.28));
  return (
    <View style={{ width: size, height: size }}>
      {avatar}
      <View
        accessibilityLabel="Online"
        className="absolute bottom-0 right-0 rounded-full border-2 border-surface bg-success"
        style={{ width: dot + 4, height: dot + 4, right: -2, bottom: -2 }}
      />
    </View>
  );
}
