import type { ReactionCounts } from "@/features/reactions";

export type FeedEntry = {
  id: string;
  type: "gym" | "steps" | "food" | "thought";
  value: unknown;
  createdAt: string;
  icon: string;
  caption: string;
  photoUrls: string[];
};


export type FeedCard = {
  cardId: string;
  user: { id: string; name: string; avatarUrl: string | null; level: number };
  latestAt: string;
  entries: FeedEntry[];
  reactions: ReactionCounts;
  commentCount: number;
};

export type FeedSection = {
  day: string;
  dayLabel: string;
  cards: FeedCard[];
};

export type RecapEntry = { userId: string; score: number; name: string; avatarUrl: string | null };

/** A weekly recap ("system post") — first page only, placed by `day` and `createdAt`. */
export type SystemPost = {
  id: string;
  day: string;
  dayLabel: string;
  createdAt: string;
  weekStart: string;
  /** Exclusive: the next week's start. */
  weekEnd: string;
  topThree: RecapEntry[];
  wallOfShame: RecapEntry[];
  reactions: ReactionCounts;
  commentCount: number;
};

export type FeedResponse = {
  sections: FeedSection[];
  hasMore: boolean;
  nextCursor: string | null;
  systemPosts?: SystemPost[];
};

/** A row in the rendered feed: a member's day card or a weekly recap. */
export type FeedItem = { kind: "card"; card: FeedCard } | { kind: "systemPost"; post: SystemPost };
