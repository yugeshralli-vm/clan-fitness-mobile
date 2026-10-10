export type FoodStatus = "yes" | "no" | "partial";

export type LogsResponse = {
  gym: { note?: string } | null;
  steps: { count: number } | null;
  food: { status?: FoodStatus; note?: string; photoUrls?: string[] } | null;
  thought: { text: string } | null;
  dailyStepsTarget: number;
  weeklyGymCount: number;
  weeklyGymTarget: number;
  gymStreak: number;
  hasLoggedToday: boolean;
};

export type LogCheckInRequest = {
  timezone?: string;
  workedOut?: boolean;
  gymNote?: string;
  stepsCount?: number;
  foodStatus?: FoodStatus;
  foodNote?: string;
  /** The day's full photo list — today's kept ones plus new uploads. */
  photoUrls?: string[];
  thought?: string;
};
