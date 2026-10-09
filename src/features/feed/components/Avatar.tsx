import { Image } from "expo-image";
import { Text, View } from "react-native";
import { colors } from "@/styles/tokens";

type Props = {
  name: string;
  avatarUrl: string | null;
  size?: number;
};

// Kept local to `feed` for now, not promoted to src/components/shared/ — only one consumer exists
// in this phase (see src/GUIDE.md's "used by 2+ features" rule for that folder).
export function Avatar({ name, avatarUrl, size = 40 }: Props) {
  const style = { width: size, height: size, borderRadius: size / 2 };

  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={style} />;
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <View style={[style, { backgroundColor: colors.surfaceBorder }]} className="items-center justify-center">
      <Text className="font-semibold text-foreground">{initial}</Text>
    </View>
  );
}
