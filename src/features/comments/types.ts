export type CommentWithUser = {
  id: string;
  checkInId: string | null;
  userId: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
};

// Same as the web COMMENT_MAX_LENGTH (src/features/comments/types.ts): the displayed text length.
export const COMMENT_MAX_LENGTH = 300;
