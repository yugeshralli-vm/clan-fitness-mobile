import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { MentionInput, type MentionInputHandle, type MentionMember } from "@/components/shared/MentionInput";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { parseCommentSegments } from "@/lib/mentions";
import { colors } from "@/styles/tokens";
import { addComment, deleteComment } from "../services/comments";
import { COMMENT_MAX_LENGTH, type CommentWithUser } from "../types";

/**
 * Port of the web CommentThread: each comment as avatar + bold name + text (mentions in accent),
 * a ✕ on your own, and the "Add a comment... (@ to mention)" composer with Post.
 */
export function CommentThread({
  checkInId,
  clanId,
  comments,
  loading,
  currentUserId,
  members,
  onCommentsChange,
}: {
  checkInId: string;
  clanId: string;
  comments: CommentWithUser[];
  loading: boolean;
  currentUserId: string | undefined;
  members: MentionMember[];
  onCommentsChange: (next: CommentWithUser[]) => void;
}) {
  const getToken = useApiToken();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<MentionInputHandle>(null);

  async function handleAdd() {
    if (!text.trim() || pending) return;
    const raw = inputRef.current?.getMarkupValue() ?? text;
    setPending(true);
    try {
      const { comment } = await addComment(getToken, checkInId, clanId, raw);
      setError(null);
      setText("");
      inputRef.current?.reset();
      onCommentsChange([...comments, comment]);
    } catch (err) {
      setError(err instanceof Error ? readError(err.message) : "Couldn't post that comment.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(commentId: string) {
    setPending(true);
    try {
      await deleteComment(getToken, commentId);
      onCommentsChange(comments.filter((c) => c.id !== commentId));
    } catch {
      setError("Couldn't delete that comment.");
    } finally {
      setPending(false);
    }
  }

  return (
    // min-h-60 like the web: room above the composer for the @mention suggestions to open into.
    <View className="min-h-60 justify-end gap-2">
      {loading && comments.length === 0 && <ActivityIndicator color={colors.accent} />}
      {comments.length > 0 && (
        <View className="gap-2">
          {comments.map((comment) => (
            <View key={comment.id} className="min-w-0 flex-row items-start gap-2">
              <Avatar name={comment.user.name} avatarUrl={comment.user.avatarUrl} size={24} />
              <Text className="min-w-0 flex-1 text-sm text-foregroundSecondary">
                <Text className="text-sm font-semibold">{comment.user.name}</Text>{" "}
                {parseCommentSegments(comment.text).map((segment, i) =>
                  segment.type === "mention" ? (
                    <Text key={i} className="text-sm font-semibold text-accent">
                      @{segment.name}
                    </Text>
                  ) : (
                    <Text key={i} className="text-sm text-foregroundSecondary">
                      {segment.value}
                    </Text>
                  ),
                )}
              </Text>
              {comment.userId === currentUserId && (
                <Pressable onPress={() => handleDelete(comment.id)} disabled={pending} className="-m-2 p-2" accessibilityLabel="Delete comment">
                  <Text className="text-xs text-foregroundMuted">✕</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}

      <View className="flex-row items-center gap-2">
        <MentionInput
          ref={inputRef}
          value={text}
          onChange={setText}
          members={members}
          excludeUserId={currentUserId}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder="Add a comment... (@ to mention)"
          onSubmitEditing={handleAdd}
        />
        <Pressable onPress={handleAdd} disabled={pending || !text.trim()} className={pending || !text.trim() ? "opacity-40" : ""}>
          <Text className="text-sm font-semibold text-accent">Post</Text>
        </Pressable>
      </View>
      {error && <Text className="text-xs text-danger">{error}</Text>}
    </View>
  );
}

/** apiFetch errors carry the response body; the API sends { error } JSON. */
function readError(message: string) {
  try {
    return JSON.parse(message).error ?? message;
  } catch {
    return message;
  }
}
