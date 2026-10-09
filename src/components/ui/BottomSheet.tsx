import { X } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { Keyboard, Modal, Pressable, ScrollView, View } from "react-native";
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
  // Lift the panel above the on-screen keyboard (a sheet with an input, e.g. comments, would
  // otherwise have its composer covered). The web gets this from the browser's own viewport resize.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} accessibilityLabel="Close" />
        <View
          className="max-h-[85%] w-full rounded-t-2xl border-t border-surfaceBorder bg-surface p-5"
          style={{ paddingBottom: Math.max(32 + insets.bottom, keyboardHeight + 16) }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-semibold">{title}</Text>
            <Pressable onPress={onClose} className="-m-2.5 p-2.5" accessibilityLabel="Close">
              <X size={20} color={colors.foregroundTertiary} />
            </Pressable>
          </View>
          {/* "handled": taps on buttons inside (e.g. an @mention suggestion) reach them instead of
              first just dismissing the keyboard. */}
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}
