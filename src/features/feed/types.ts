export type Clan = {
  id: string;
  name: string;
  imageUrl: string | null;
  role: "admin" | "member";
};

export type ClansResponse = {
  clans: Clan[];
};

export type FeedEntry = {
  id: string;
  type: "gym" | "steps" | "food" | "thought";
  value: unknown;
  createdAt: string;
  icon: string;
  caption: string;
};

export type FeedCard = {
  cardId: string;
  user: { id: string; name: string; avatarUrl: string | null };
  latestAt: string;
  entries: FeedEntry[];
  reactionCount: number;
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
