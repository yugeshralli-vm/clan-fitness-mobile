export type FeedEntry = {
  id: string;
  type: "gym" | "steps" | "food" | "thought";
  value: unknown;
  createdAt: string;
  icon: string;
  caption: string;
  photoUrls: string[];
};

/** Per emoji, as the web ReactionBar shows it: how many, and whether the viewer is one of them. */
export type ReactionCounts = Record<string, { count: number; reactedByMe: boolean }>;

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

export type FeedResponse = {
  sections: FeedSection[];
  hasMore: boolean;
  nextCursor: string | null;
};
