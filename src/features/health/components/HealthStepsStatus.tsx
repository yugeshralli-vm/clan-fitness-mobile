import { Pressable, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { openHealthConnectInPlayStore } from "../services/health-connect";
import { useHealthSteps } from "../HealthStepsProvider";

function timeAgo(at: number) {
  const minutes = Math.round((Date.now() - at) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  return new Date(at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * Native-only addition under the Steps input (the PWA can't read device steps). Uses the same
 * primitives and text styles as the rest of the ported Log form — secondary Button, xs tertiary
 * helper text, accent text link — so it reads as part of the web design.
 */
export function HealthStepsStatus() {
  const { status, steps, readAt, reading, connect, refresh } = useHealthSteps();

  if (status === "checking" || status === "unavailable") return null;

  if (status === "needs-update") {
    return (
      <Pressable onPress={openHealthConnectInPlayStore}>
        <Text className="text-xs text-foregroundTertiary">
          Install or update Health Connect to fill in your steps automatically.{" "}
          <Text className="text-xs font-semibold text-accent">Open</Text>
        </Text>
      </Pressable>
    );
  }

  if (status === "needs-permission") {
    return (
      <View className="gap-2">
        <Text className="text-xs text-foregroundTertiary">
          Fill in your steps from Google Fit, Samsung Health, Fitbit and other apps. Nothing is logged until you save.
        </Text>
        <Button variant="secondary" title="Get steps from Health Connect" onPress={connect} />
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between gap-2">
      {/* flex-1 + a single-line link: Android otherwise mis-measures the pair and clips the link. */}
      <Text className="flex-1 text-xs text-foregroundTertiary">
        {steps !== null && readAt !== null
          ? `Health Connect: ${steps.toLocaleString("en-US")} steps today · ${timeAgo(readAt)}`
          : "Reading steps from Health Connect…"}
      </Text>
      <Pressable onPress={refresh} disabled={reading} className="min-h-11 shrink-0 justify-center">
        <Text numberOfLines={1} className="text-xs font-semibold text-accent">
          {reading ? "Reading…" : "Refresh"}
        </Text>
      </Pressable>
    </View>
  );
}
