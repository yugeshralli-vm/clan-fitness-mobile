import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { GetToken } from "@/hooks/useApiToken";
import { apiFetch } from "@/services/api-client";
import { colors } from "@/styles/tokens";

// The FCM token this phone last registered with the server, so "on/off" survives restarts and
// sign-out can unregister it.
const REGISTERED_TOKEN_KEY = "push-registered-token";
const PROMPTED_KEY = "push-prompted";
// Set when someone turns push off in Settings, so the app doesn't quietly turn it back on.
const DISABLED_KEY = "push-disabled";

/** Android 8+ shows nothing without a channel; the server sends to "default". */
async function ensureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Clan activity",
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: colors.accent,
  });
}

/**
 * "granted", "denied" (blocked — only Android settings can undo it), or "undetermined" (we can
 * still ask). Android reports a never-asked permission as denied-but-askable, hence canAskAgain.
 */
export async function getPermission(): Promise<"granted" | "denied" | "undetermined"> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status === "granted") return "granted";
  return canAskAgain ? "undetermined" : "denied";
}

export async function getRegisteredToken() {
  return SecureStore.getItemAsync(REGISTERED_TOKEN_KEY).catch(() => null);
}

export async function isTurnedOff() {
  return (await SecureStore.getItemAsync(DISABLED_KEY).catch(() => null)) === "1";
}

/** Asks for permission (if needed), then registers this phone's FCM token. True if push is on. */
export async function enablePush(getToken: GetToken): Promise<boolean> {
  await ensureChannel();
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return false;

  const { data: token } = await Notifications.getDevicePushTokenAsync();
  await apiFetch<void>("/api/v1/push-tokens", getToken, { method: "POST", body: JSON.stringify({ token }) });
  await SecureStore.setItemAsync(REGISTERED_TOKEN_KEY, String(token)).catch(() => {});
  await SecureStore.deleteItemAsync(DISABLED_KEY).catch(() => {});
  return true;
}

/** Unregisters this phone — `turnOff` when the user switched push off (not just signing out). */
export async function disablePush(getToken: GetToken, { turnOff = false } = {}) {
  if (turnOff) await SecureStore.setItemAsync(DISABLED_KEY, "1").catch(() => {});
  const token = await getRegisteredToken();
  if (!token) return;
  await apiFetch<void>("/api/v1/push-tokens", getToken, { method: "DELETE", body: JSON.stringify({ token }) }).catch(() => {});
  await SecureStore.deleteItemAsync(REGISTERED_TOKEN_KEY).catch(() => {});
}

export function sendTestPush(getToken: GetToken) {
  return apiFetch<{ sent: number }>("/api/v1/push-tokens/test", getToken, { method: "POST" });
}

/** Whether we've already asked once on our own (the web's markPrompted). */
export async function wasPrompted() {
  return (await SecureStore.getItemAsync(PROMPTED_KEY).catch(() => null)) === "1";
}

export function markPrompted() {
  SecureStore.setItemAsync(PROMPTED_KEY, "1").catch(() => {});
}
