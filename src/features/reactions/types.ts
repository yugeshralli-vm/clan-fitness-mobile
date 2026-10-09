export type Reactor = { id: string; name: string; avatarUrl: string | null };

/** Per emoji, as the web ReactionBar shows it. `users` is only present when fetched with names. */
export type ReactionCounts = Record<string, { count: number; reactedByMe: boolean; users?: Reactor[] }>;

// Same order as the web REACTION_EMOJIS.
export const REACTION_EMOJIS = ["🔥", "👏", "👎"] as const;
