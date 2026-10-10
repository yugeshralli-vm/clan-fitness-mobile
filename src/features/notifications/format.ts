const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function ago(value: number, unit: "minute" | "hour" | "day") {
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

/**
 * The web's formatRelativeTime ("5 minutes ago", "yesterday", "Oct 3"), written out because
 * Hermes has no Intl.RelativeTimeFormat. Same thresholds and English output as
 * RelativeTimeFormat("en", { numeric: "auto" }) for past times.
 */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  if (Math.abs(diffMs) >= WEEK_MS) return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 1) return "Just now";
  if (Math.abs(minutes) < 60) return minutes > 0 ? ago(minutes, "minute") : "in a moment";

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return ago(Math.max(hours, 1), "hour");

  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : ago(days, "day");
}
