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

export type FeedResponse = {
  sections: FeedSection[];
  hasMore: boolean;
  nextCursor: string | null;
};
