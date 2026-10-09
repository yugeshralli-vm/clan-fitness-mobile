import { Pressable, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { openHealthConnectSettings } from "../services/health-connect";
import { useStepSync } from "../StepSyncProvider";

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
export function StepSyncStatus() {
  const { status, lastSync, syncing, connect, syncNow } = useStepSync();

  if (status === "checking" || status === "unavailable") return null;

  if (status === "needs-update") {
    return (
      <Pressable onPress={openHealthConnectSettings}>
        <Text className="text-xs text-foregroundTertiary">
          Update Health Connect to sync your steps automatically. <Text className="text-xs font-semibold text-accent">Open</Text>
        </Text>
      </Pressable>
    );
  }

  if (status === "needs-permission") {
    return (
      <View className="gap-2">
        <Text className="text-xs text-foregroundTertiary">
          Fill in your steps automatically from Google Fit, Samsung Health, Fitbit and other apps.
        </Text>
        <Button variant="secondary" title="Sync steps from Health Connect" onPress={connect} />
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between gap-2">
      {/* flex-1 + a single-line link: Android otherwise mis-measures the pair and clips "Sync now". */}
      <Text className="flex-1 text-xs text-foregroundTertiary">
        {lastSync
          ? `Synced from Health Connect · ${lastSync.steps.toLocaleString("en-US")} steps · ${timeAgo(lastSync.at)}`
          : "Syncing from Health Connect automatically"}
      </Text>
      <Pressable onPress={syncNow} disabled={syncing} className="min-h-11 shrink-0 justify-center">
        <Text numberOfLines={1} className="text-xs font-semibold text-accent">
          {syncing ? "Syncing…" : "Sync now"}
        </Text>
      </Pressable>
    </View>
  );
}
