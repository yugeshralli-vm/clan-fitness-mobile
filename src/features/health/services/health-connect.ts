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

/** Shows the system Health Connect permission sheet for step reads. True if granted. */
export async function requestStepsPermission(): Promise<boolean> {
  if (!(await ensureInitialized())) return false;
  const granted = await requestPermission([STEPS_READ]);
  return granted.some((p) => p.recordType === "Steps" && p.accessType === "read");
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

export { openHealthConnectSettings };
