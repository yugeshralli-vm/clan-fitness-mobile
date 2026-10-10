import type { Reactor } from "@/features/reactions";

/** Same limit the server enforces on the displayed text (src/features/clan-chat/types.ts on web). */
export const CLAN_MESSAGE_MAX_LENGTH = 2000;

/** The chat's hold-to-react tray — same set as web's CHAT_REACTION_EMOJIS. */
export const CHAT_REACTION_EMOJIS = ["🔥", "👏", "👎", "❤️", "😂", "😮", "😢", "🙏"] as const;

/** Per emoji, who reacted and whether the viewer did — the web's ReactionSummary. */
export type MessageReactions = Record<string, { reactedByMe: boolean; users: Reactor[] }>;

/** One message as GET /api/v1/chat returns it (web's ClanMessageRow, dates as ISO strings). */
export type ClanMessage = {
  id: string;
  clanId: string;
  userId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  authorLevel: number;
  body: string;
  createdAt: string;
  replyToMessageId: string | null;
  replyToAuthorName: string | null;
  replyToBody: string | null;
  reactionsSummary: MessageReactions;
};
