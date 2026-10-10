export type CheckInType = "gym" | "steps" | "food" | "thought";
export type HistoryRange = "7d" | "30d" | "90d" | "all";
export type HeatmapDayState = "met" | "under" | "none" | "future";

export type HistoryEntry = {
  id: string;
  type: CheckInType;
  value: unknown;
  createdAt: string;
  icon: string;
  caption: string;
  photoUrls: string[];
};

export type HistoryPage = { days: { dayKey: string; entries: HistoryEntry[] }[]; hasMore: boolean };

/** GET /api/v1/users/:userId — the `me` fields only come back for yourself. */
export type ProfileResponse = {
  user: { id: string; name: string; avatarUrl: string | null; bio: string | null; level: number; timezone: string };
  isMe: boolean;
  heatmap: { dayKey: string; dayOfWeek: number; state: HeatmapDayState }[];
  history: HistoryPage;
  goals?: { gymDaysPerWeek: number | null; stepsPerDay: number | null };
  details?: {
    unitsPreference: "metric" | "imperial";
    height: number | null;
    weight: number | null;
    dateOfBirth: string | null;
    gender: string | null;
    bio: string | null;
    age: number | null;
    bmi: number | null;
  };
  notificationPreferences?: Record<"notifyOnComments" | "notifyOnMentions" | "notifyOnReactions" | "notifyOnCheckIns", boolean>;
  levelProgress?: { level: number; pointsIntoLevel: number; pointsForNextLevel: number; progress: number; totalPoints: number; pendingPoints: number };
};
