import { useUser } from "@clerk/expo";
import { MessageCircle } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { useClanMembers } from "@/features/clans";
import { useApiToken } from "@/hooks/useApiToken";
import { colors } from "@/styles/tokens";
import { getComments } from "../services/comments";
import type { CommentWithUser } from "../types";
import { CommentThread } from "./CommentThread";

/**
 * Port of the web CommentSheet: the comment pill on a feed card (count when there are any), opening
 * a "Comments" sheet. Comments load when the sheet opens — the feed only carries the count.
 */
export function CommentSheet({
  checkInId,
  clanId,
  count,
  onCountChange,
}: {
  checkInId: string;
  clanId: string;
  count: number;
  onCountChange: (count: number) => void;
}) {
  const getToken = useApiToken();
  const { user } = useUser();
  const members = useClanMembers(clanId);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    setOpen(true);
    setLoading(true);
    try {
      const { comments: fetched } = await getComments(getToken, checkInId, clanId);
      setComments(fetched);
      onCountChange(fetched.length);
    } catch {
      // The sheet still opens with the composer; a retry is just reopening it.
    } finally {
      setLoading(false);
    }
  }

  function handleCommentsChange(next: CommentWithUser[]) {
    setComments(next);
    onCountChange(next.length);
  }

  return (
    <>
      <Pressable
        onPress={handleOpen}
        accessibilityLabel={count > 0 ? `${count} comments` : "Add a comment"}
        className="min-h-9 flex-row items-center gap-1.5 rounded-full border border-surfaceBorder px-3 py-1.5"
      >
        <MessageCircle size={16} color={colors.foregroundTertiary} />
        {count > 0 && <Text className="text-xs text-foregroundTertiary">{count}</Text>}
      </Pressable>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Comments">
        <CommentThread
          checkInId={checkInId}
          clanId={clanId}
          comments={comments}
          loading={loading}
          currentUserId={user?.id}
          members={members}
          onCommentsChange={handleCommentsChange}
        />
      </BottomSheet>
    </>
  );
}
