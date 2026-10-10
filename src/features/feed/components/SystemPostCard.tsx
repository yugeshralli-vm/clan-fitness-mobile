import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { Text } from "@/components/ui/Text";
import { CommentSheet } from "@/features/comments";
import { useOpenProfile } from "@/features/profile";
import { ReactionBar } from "@/features/reactions";
import { colors } from "@/styles/tokens";
import type { SystemPost } from "../types";

const MEDALS = ["🥇", "🥈", "🥉"];
const DAY_MS = 24 * 60 * 60 * 1000;

function formatWeekRange(weekStart: string, weekEnd: string) {
  // weekEnd is exclusive (the next week's start) — show the last real day, like the web.
  const format = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${format(new Date(weekStart))} – ${format(new Date(new Date(weekEnd).getTime() - DAY_MS))}`;
}

/**
 * Port of the web SystemPostCard, the weekly recap: posted by "Clan Fitness", the week's 🏆 Wall of
 * Fame (top three with medals and score bars) and 🙈 Wall of shame, then reactions and comments
 * like any card. Accent-tinted border and a faint accent-to-surface gradient.
 */
export function SystemPostCard({ post, clanId }: { post: SystemPost; clanId: string }) {
  const openProfile = useOpenProfile();
  const [reactions, setReactions] = useState(post.reactions ?? {});
  const [commentCount, setCommentCount] = useState(post.commentCount);
  useEffect(() => setReactions(post.reactions ?? {}), [post.reactions]);
  useEffect(() => setCommentCount(post.commentCount), [post.commentCount]);
  const maxScore = Math.max(1, ...post.topThree.map((entry) => entry.score));
  const target = { systemPostId: post.id };

  return (
    <View
      className="flex-row items-start gap-3 rounded-lg border border-accent/20 p-3"
      style={{ experimental_backgroundImage: `linear-gradient(to bottom, rgba(59, 255, 173, 0.05), ${colors.surface})` }}
    >
      <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
        <Text className="text-xs font-bold text-accentForeground">C</Text>
      </View>
      <View className="min-w-0 flex-1 gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-sm font-semibold">Clan Fitness</Text>
          <Text className="shrink-0 text-xs text-foregroundMuted">
            {new Date(post.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </Text>
        </View>

        {post.topThree.length > 0 && (
          <View className="gap-1.5">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-accent/15 px-2 py-0.5">
                <Text className="text-xs font-semibold text-accent">🏆 Wall of Fame</Text>
              </View>
              <Text className="text-xs text-foregroundMuted">{formatWeekRange(post.weekStart, post.weekEnd)}</Text>
            </View>
            {post.topThree.map((entry, i) => (
              <View key={entry.userId} className="flex-row items-center gap-2">
                <Text className="w-4 shrink-0 text-center text-sm">{MEDALS[i]}</Text>
                <Pressable onPress={() => openProfile(entry.userId)} className="min-w-0 flex-1 flex-row items-center gap-2">
                  <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size={20} />
                  <Text numberOfLines={1} className="min-w-0 flex-1 text-sm">
                    {entry.name}
                  </Text>
                </Pressable>
                <View className="h-1 w-11 shrink-0 overflow-hidden rounded-full bg-surfaceBorder">
                  <View className="h-full rounded-full bg-accent" style={{ width: `${Math.round((entry.score / maxScore) * 100)}%` }} />
                </View>
                <Text className="w-8 shrink-0 text-right text-xs text-foregroundTertiary">{Math.round(entry.score)}</Text>
              </View>
            ))}
          </View>
        )}

        {post.wallOfShame.length > 0 && (
          <View className="gap-1.5 border-t border-dashed border-surfaceBorder pt-2">
            <View className="self-start rounded-full bg-ember/15 px-2 py-0.5">
              <Text className="text-xs font-semibold text-ember">🙈 Wall of shame</Text>
            </View>
            <View className="flex-row flex-wrap gap-1.5">
              {post.wallOfShame.map((entry) => (
                <Pressable
                  key={entry.userId}
                  onPress={() => openProfile(entry.userId)}
                  className="flex-row items-center gap-1.5 rounded-full border border-surfaceBorder bg-background px-2 py-1"
                >
                  <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size={17} />
                  <Text className="text-xs text-foregroundSecondary">{entry.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View className="flex-row flex-wrap items-center gap-2">
          <ReactionBar target={target} clanId={clanId} reactions={reactions} onChange={setReactions} />
          <CommentSheet target={target} clanId={clanId} count={commentCount} onCountChange={setCommentCount} />
        </View>
      </View>
    </View>
  );
}
