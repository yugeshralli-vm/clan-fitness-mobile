import { Linking } from "react-native";
import {
  aggregateRecord,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
  requestPermission,
  SdkAvailabilityStatus,
} from "react-native-health-connect";

export type HealthConnectStatus = "unavailable" | "needs-update" | "needs-permission" | "ready";

const STEPS_READ = { accessType: "read", recordType: "Steps" } as const;

let initialized = false;

async function ensureInitialized() {
  if (!initialized) initialized = await initialize();
  return initialized;
}

/** Whether Health Connect exists on this phone, is up to date, and has granted us step reads. */
export async function getHealthConnectStatus(): Promise<HealthConnectStatus> {
  const sdk = await getSdkStatus();
  if (sdk === SdkAvailabilityStatus.SDK_UNAVAILABLE) return "unavailable";
  if (sdk === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) return "needs-update";
  if (!(await ensureInitialized())) return "unavailable";
  const granted = await getGrantedPermissions();
  return granted.some((p) => p.recordType === "Steps" && p.accessType === "read") ? "ready" : "needs-permission";
}

/** Faster than anyone can answer the sheet: it was never shown. */
const NO_SHEET_MS = 800;

/**
 * Shows the system Health Connect permission sheet for step reads. True if granted. Once someone
 * has said no (twice on Android 14+), Android stops showing the sheet and denies at once, so the
 * button would do nothing; then Health Connect's own settings open instead, where they can allow it.
 */
export async function requestStepsPermission(): Promise<boolean> {
  if (!(await ensureInitialized())) return false;
  const startedAt = Date.now();
  const granted = await requestPermission([STEPS_READ]);
  const ok = granted.some((p) => p.recordType === "Steps" && p.accessType === "read");
  // Only reached when the SDK is available, so the settings screen exists to open.
  if (!ok && Date.now() - startedAt < NO_SHEET_MS) openHealthConnectSettings();
  return ok;
}

/**
 * Today's step total across every app writing to Health Connect (Google Fit, Samsung Health,
 * Fitbit…), from local midnight until now. Uses Health Connect's aggregate rather than summing raw
 * records, so overlapping sources (phone + watch counting the same walk) aren't double-counted.
 */
export async function readTodaysSteps(): Promise<number> {
  await ensureInitialized();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const result = await aggregateRecord({
    recordType: "Steps",
    timeRangeFilter: { operator: "between", startTime: startOfDay.toISOString(), endTime: new Date().toISOString() },
  });
  return Math.round(result.COUNT_TOTAL ?? 0);
}

const HEALTH_CONNECT_PACKAGE = "com.google.android.apps.healthdata";

/**
 * Opens Health Connect's Play Store page, as Google recommends for "needs-update". On Android 13
 * and below that status also means it isn't installed at all, so its settings screen can't be
 * opened (the system has nothing to handle the intent, which crashes the app).
 */
export async function openHealthConnectInPlayStore() {
  const onboarding = encodeURIComponent("healthconnect://onboarding");
  await Linking.openURL(`market://details?id=${HEALTH_CONNECT_PACKAGE}&url=${onboarding}`).catch(() =>
    Linking.openURL(`https://play.google.com/store/apps/details?id=${HEALTH_CONNECT_PACKAGE}`).catch(() => {}),
  );
}
