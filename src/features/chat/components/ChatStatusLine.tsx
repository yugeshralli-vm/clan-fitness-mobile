import { View } from "react-native";
import type { MentionMember } from "@/components/shared/MentionInput";
import { Text } from "@/components/ui/Text";

const MAX_NAMED_ONLINE = 2;

function firstName(member: MentionMember) {
  return member.name.split(" ")[0];
}

/**
 * Port of the web ChatStatusLine: "Aarav is typing…" while anyone else is typing, otherwise who
 * else has the app open. Renders nothing when neither is known — presence is null without a
 * realtime connection.
 */
export function ChatStatusLine({
  members,
  currentUserId,
  onlineUserIds,
  typingUserIds,
}: {
  members: MentionMember[];
  currentUserId: string | undefined;
  onlineUserIds: readonly string[] | null;
  typingUserIds: readonly string[];
}) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const typing = typingUserIds.flatMap((id) => byId.get(id) ?? []);
  const online = (onlineUserIds ?? []).filter((id) => id !== currentUserId).flatMap((id) => byId.get(id) ?? []);

  if (typing.length > 0) {
    const label =
      typing.length === 1
        ? `${firstName(typing[0])} is typing…`
        : typing.length === 2
          ? `${firstName(typing[0])} and ${firstName(typing[1])} are typing…`
          : "Several people are typing…";
    return (
      <Text numberOfLines={1} accessibilityLiveRegion="polite" className="text-xs text-foregroundTertiary">
        {label}
      </Text>
    );
  }

  if (online.length === 0) return null;

  const named = online.slice(0, MAX_NAMED_ONLINE).map(firstName).join(", ");
  const rest = online.length - MAX_NAMED_ONLINE;
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
      <Text numberOfLines={1} className="flex-1 text-xs text-foregroundTertiary">
        {rest > 0 ? `${named} + ${rest} online` : `${named} online`}
      </Text>
    </View>
  );
}
