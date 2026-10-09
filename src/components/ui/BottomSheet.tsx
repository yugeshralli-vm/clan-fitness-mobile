import { X } from "lucide-react-native";
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/styles/tokens";
import { Text } from "./Text";

/**
 * Port of the web BottomSheet: dimmed backdrop, surface panel with rounded top corners and a top
 * border, title row with a close X, content scrolling inside up to 85% of the screen.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} accessibilityLabel="Close" />
        <View
          className="max-h-[85%] w-full rounded-t-2xl border-t border-surfaceBorder bg-surface p-5"
          style={{ paddingBottom: 32 + insets.bottom }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-semibold">{title}</Text>
            <Pressable onPress={onClose} className="-m-2.5 p-2.5" accessibilityLabel="Close">
              <X size={20} color={colors.foregroundTertiary} />
            </Pressable>
          </View>
          <ScrollView>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}
