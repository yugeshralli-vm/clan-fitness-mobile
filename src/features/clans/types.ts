export type Clan = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  role: "admin" | "member";
  memberCount: number;
  maxSize: number;
};

export type ClansResponse = {
  clans: Clan[];
};

export type ClanMember = {
  id: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  role: "admin" | "member";
};

/** A leaderboard row as GET /api/v1/clans/:clanId returns it (web computeLeaderboard). */
export type LeaderboardEntry = {
  user: { id: string; name: string; avatarUrl: string | null };
  periodCount: number;
  periodTarget: number;
  periodSteps: number;
  periodStepsTarget: number;
  streak: number;
  stepPct: number;
  gymPct: number;
  score: number;
};

export type LeaderboardPeriod = "today" | "yesterday" | "week" | "month";

/** GET /api/v1/clans/:clanId — the web clan page's data. */
export type ClanDetail = {
  clan: { id: string; name: string; description: string | null; memberCount: number; maxSize: number; inviteCode: string | null };
  role: "admin" | "member";
  members: (ClanMember & { joinedAt: string; loggedToday: boolean })[];
  leaderboards: Record<LeaderboardPeriod, LeaderboardEntry[]>;
};
