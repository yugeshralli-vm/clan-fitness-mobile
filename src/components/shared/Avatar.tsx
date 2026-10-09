import { Image } from "expo-image";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";

/** Port of the web Avatar: round image, or the first initial on the background color. */
export function Avatar({ name, avatarUrl, size = 32 }: { name: string; avatarUrl: string | null; size?: number }) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (avatarUrl) return <Image source={{ uri: avatarUrl }} style={style} />;
  return (
    <View style={style} className="items-center justify-center bg-background">
      <Text className="text-xs font-semibold text-foregroundSecondary">{name.trim().charAt(0).toUpperCase() || "?"}</Text>
    </View>
  );
}
