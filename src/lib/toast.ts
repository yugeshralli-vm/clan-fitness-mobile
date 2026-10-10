import { Platform, ToastAndroid } from "react-native";

/** The web's success toasts (useActionToast) — Android's own toast. */
export function toast(message: string) {
  if (Platform.OS === "android") ToastAndroid.show(message, ToastAndroid.SHORT);
}
