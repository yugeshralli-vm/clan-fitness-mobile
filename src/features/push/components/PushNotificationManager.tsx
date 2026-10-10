import { useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { apiErrorMessage } from "@/lib/api-error";
import { disablePush, enablePush, getPermission, isTurnedOff, sendTestPush } from "../services/push";

/**
 * Port of the web PushNotificationManager: "Enable notifications", or — once on — "Notifications
 * are on for this device." with Turn off, and "Send test notification". If Android notifications
 * are blocked for the app, points to its system settings instead.
 */
export function PushNotificationManager() {
  const getToken = useApiToken();
  const [state, setState] = useState<"checking" | "on" | "off" | "blocked">("checking");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testState, setTestState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPermission(), isTurnedOff()]).then(([permission, turnedOff]) =>
      setState(permission === "denied" ? "blocked" : permission === "granted" && !turnedOff ? "on" : "off"),
    );
  }, []);

  async function handleEnable() {
    setPending(true);
    setError(null);
    try {
      const on = await enablePush(getToken);
      setState(on ? "on" : (await getPermission()) === "denied" ? "blocked" : "off");
    } catch {
      setError("Couldn't turn on notifications.");
    } finally {
      setPending(false);
    }
  }

  async function handleDisable() {
    setPending(true);
    await disablePush(getToken, { turnOff: true });
    setState("off");
    setPending(false);
  }

  async function handleSendTest() {
    setTestState("sending");
    setTestError(null);
    try {
      await sendTestPush(getToken);
      setTestState("sent");
    } catch (err) {
      setTestError(apiErrorMessage(err, "Couldn't send a test notification."));
      setTestState("error");
    }
  }

  if (state === "checking") return null;

  if (state === "blocked") {
    return (
      <View className="gap-3">
        <Text className="text-sm text-foregroundSecondary">Notifications are turned off for Clan Fitness in Android settings.</Text>
        <View className="self-start">
          <Button variant="secondary" title="Open settings" onPress={() => Linking.openSettings()} />
        </View>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {state === "on" ? (
        <>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="shrink text-sm text-foregroundSecondary">Notifications are on for this device.</Text>
            <Button variant="secondary" title="Turn off" onPress={handleDisable} disabled={pending} />
          </View>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="shrink text-sm text-foregroundTertiary">
              {testState === "sent" ? "Sent — check your notifications." : "Not sure it's working?"}
            </Text>
            <Button
              variant="secondary"
              title={testState === "sending" ? "Sending…" : "Send test notification"}
              onPress={handleSendTest}
              disabled={testState === "sending"}
            />
          </View>
          {testError && <Text className="text-sm text-danger">{testError}</Text>}
        </>
      ) : (
        <Button title="Enable notifications" onPress={handleEnable} disabled={pending} />
      )}
      {error && <Text className="text-sm text-danger">{error}</Text>}
    </View>
  );
}
