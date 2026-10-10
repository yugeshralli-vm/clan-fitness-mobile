import { useUser } from "@clerk/expo";
import { useIsFocused } from "expo-router";
import { X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { MentionInput, type MentionInputHandle } from "@/components/shared/MentionInput";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useActiveClan, useClanMembers } from "@/features/clans";
import { usePresence, useRealtime, useTypingIndicator } from "@/features/realtime";
import { useApiToken } from "@/hooks/useApiToken";
import { mentionsToPlainText } from "@/lib/mentions";
import { colors } from "@/styles/tokens";
import { markChatSeen } from "../hooks/chat-seen";
import { getMessages, sendMessage, toggleMessageReaction } from "../services/chat";
import { CLAN_MESSAGE_MAX_LENGTH, type ClanMessage } from "../types";
import { ChatMessageRow } from "./ChatMessageRow";
import { ChatStatusLine } from "./ChatStatusLine";

type ReplyingTo = { id: string; authorName: string; body: string };

/** The original chat poll rate — only used while the realtime socket isn't open (same as web). */
const FALLBACK_POLL_INTERVAL_MS = 2000;

/**
 * Port of the web clan chat page (/clans/[clanId]/chat): "<Clan> chat" heading, messages oldest to
 * newest, and the composer bar pinned at the bottom — reply preview, who's typing/online, and the
 * "@ to mention" input with Send. Your own message shows at once (optimistic); everyone else's
 * arrive via the realtime server, or a 2s poll while it's unavailable.
 */
export function ChatScreen() {
  const getToken = useApiToken();
  const { user } = useUser();
  const currentUserId = user?.id;
  const { activeClan, loading: clanLoading } = useActiveClan();
  const clanId = activeClan?.id;
  const members = useClanMembers(clanId);
  const focused = useIsFocused();

  const [messages, setMessages] = useState<{ clanId: string; list: ClanMessage[] } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const inputRef = useRef<MentionInputHandle>(null);

  const list = messages && messages.clanId === clanId ? messages.list : null;

  const refresh = useCallback(async () => {
    if (!clanId) return;
    try {
      const { messages: fetched } = await getMessages(getToken, clanId);
      setMessages({ clanId, list: fetched });
      setLoadError(null);
    } catch {
      setLoadError("Couldn't load messages.");
    }
  }, [clanId, getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useRealtime({
    events: ["chat_message", "chat_reaction"],
    clanId,
    fallbackPollMs: focused ? FALLBACK_POLL_INTERVAL_MS : undefined,
    onChange: refresh,
  });
  const onlineUserIds = usePresence(clanId ?? "");
  const { typingUserIds, notifyTyping, resetTyping } = useTypingIndicator(clanId, currentUserId);

  // Looking at the chat marks it read, including messages that arrive while it's open.
  const newest = list?.at(-1);
  useEffect(() => {
    if (focused && clanId && list) markChatSeen(clanId, newest ? Date.parse(newest.createdAt) : undefined);
  }, [focused, clanId, list, newest]);

  function handleTextChange(value: string) {
    setText(value);
    if (value.trim()) notifyTyping();
  }

  async function handleSend() {
    const displayBody = text.trim();
    if (!clanId || !displayBody || sending) return;
    const markupBody = inputRef.current?.getMarkupValue().trim() || displayBody;
    const me = members.find((m) => m.id === currentUserId);

    const optimistic: ClanMessage = {
      id: `optimistic-${Date.now()}`,
      clanId,
      userId: currentUserId ?? "",
      authorName: me?.name ?? user?.fullName ?? "You",
      authorAvatarUrl: me?.avatarUrl ?? null,
      authorLevel: me?.level ?? 1,
      body: markupBody,
      createdAt: new Date().toISOString(),
      replyToMessageId: replyingTo?.id ?? null,
      replyToAuthorName: replyingTo?.authorName ?? null,
      replyToBody: replyingTo?.body ?? null,
      reactionsSummary: {},
    };
    setMessages((prev) => ({ clanId, list: [...(prev?.clanId === clanId ? prev.list : []), optimistic] }));
    setText("");
    resetTyping();
    inputRef.current?.reset();
    const replyTo = replyingTo?.id ?? null;
    setReplyingTo(null);
    setSending(true);
    setError(null);

    try {
      await sendMessage(getToken, clanId, markupBody, replyTo);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? readError(err.message) : "Couldn't send that message.");
      setMessages((prev) => (prev ? { ...prev, list: prev.list.filter((m) => m.id !== optimistic.id) } : prev));
    } finally {
      setSending(false);
    }
  }

  async function handleReact(message: ClanMessage, emoji: string) {
    if (!clanId || reacting) return;
    setReacting(true);
    try {
      const { reactions } = await toggleMessageReaction(getToken, message.id, clanId, emoji);
      setMessages((prev) =>
        prev ? { ...prev, list: prev.list.map((m) => (m.id === message.id ? { ...m, reactionsSummary: reactions } : m)) } : prev,
      );
    } catch {
      setError("Couldn't react to that message.");
    } finally {
      setReacting(false);
    }
  }

  if (clanLoading && !activeClan) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (!activeClan) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-foregroundTertiary">Join a clan to chat with it.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Inverted: newest at the bottom and the list opens there, like the web page scrolled down. */}
      <FlatList
        inverted
        className="flex-1"
        data={list ? [...list].reverse() : []}
        keyExtractor={(message) => message.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <ChatMessageRow
            message={item}
            mine={item.userId === currentUserId}
            currentUserId={currentUserId}
            pending={reacting}
            onReply={(replied) => setReplyingTo({ id: replied.id, authorName: replied.authorName, body: replied.body })}
            onReact={handleReact}
          />
        )}
        // Rendered at the top of an inverted list.
        ListFooterComponent={
          <View className="gap-1 pb-4 pt-4">
            <Text className="text-xl font-bold">{activeClan.name} chat</Text>
            {loadError && <Text className="text-sm text-danger">{loadError}</Text>}
          </View>
        }
        ListEmptyComponent={
          list ? (
            <Text className="py-8 text-center text-sm text-foregroundTertiary">No messages yet — say hi to your clan.</Text>
          ) : !loadError ? (
            <ActivityIndicator className="py-8" color={colors.accent} />
          ) : null
        }
      />

      <View className="border-t border-surfaceBorder bg-surface">
        {replyingTo && (
          <View className="flex-row items-center justify-between gap-2 border-b border-surfaceBorder px-6 py-2">
            <View className="min-w-0 flex-1 border-l-2 border-accent pl-2">
              <Text numberOfLines={1} className="text-xs font-semibold text-accent">
                Replying to {replyingTo.authorName}
              </Text>
              <Text numberOfLines={1} className="text-xs text-foregroundTertiary">
                {mentionsToPlainText(replyingTo.body)}
              </Text>
            </View>
            <Pressable onPress={() => setReplyingTo(null)} accessibilityLabel="Cancel reply" className="-m-2 shrink-0 p-2">
              <X size={16} color={colors.foregroundMuted} />
            </Pressable>
          </View>
        )}
        {(typingUserIds.length > 0 || (onlineUserIds?.some((id) => id !== currentUserId) ?? false)) && (
          <View className="px-6 pt-2">
            <ChatStatusLine members={members} currentUserId={currentUserId} onlineUserIds={onlineUserIds} typingUserIds={typingUserIds} />
          </View>
        )}
        <View className="flex-row items-center gap-2 px-6 py-3">
          <MentionInput
            ref={inputRef}
            value={text}
            onChange={handleTextChange}
            members={members}
            excludeUserId={currentUserId}
            allowEveryone
            maxLength={CLAN_MESSAGE_MAX_LENGTH}
            placeholder="Type a message... (@ to mention)"
            onSubmitEditing={handleSend}
          />
          <Button title="Send" onPress={handleSend} disabled={sending || !text.trim()} />
        </View>
        {error && <Text className="px-6 pb-2 text-xs text-danger">{error}</Text>}
      </View>
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
