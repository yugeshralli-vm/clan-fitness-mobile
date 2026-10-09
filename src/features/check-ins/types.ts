export type FoodStatus = "yes" | "no" | "partial";

export type LogsResponse = {
  gym: { note?: string } | null;
  steps: { count: number } | null;
  food: { status?: FoodStatus; note?: string } | null;
  thought: { text: string } | null;
  dailyStepsTarget: number;
  hasLoggedToday: boolean;
};

export type LogCheckInRequest = {
  timezone?: string;
  workedOut?: boolean;
  gymNote?: string;
  stepsCount?: number;
  foodStatus?: FoodStatus;
  foodNote?: string;
  thought?: string;
};
