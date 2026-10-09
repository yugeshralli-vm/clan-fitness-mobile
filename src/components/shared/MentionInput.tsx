import { Users } from "lucide-react-native";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Pressable, TextInput, View, type TextInputSelectionChangeEvent } from "react-native";
import { Text } from "@/components/ui/Text";
import { buildMentionMarkup, MENTION_EVERYONE_ID, type ResolvedMention } from "@/lib/mentions";
import { colors } from "@/styles/tokens";
import { Avatar } from "./Avatar";

export type MentionMember = { id: string; name: string; avatarUrl: string | null };

export type MentionInputHandle = {
  /** Current text rewritten with `@[Name](id)` markup for resolved mentions — read at submit time. */
  getMarkupValue: () => string;
  /** Clears tracked mentions — call after a successful submit, alongside resetting `value`. */
  reset: () => void;
};

const EVERYONE_OPTION: MentionMember = { id: MENTION_EVERYONE_ID, name: "everyone", avatarUrl: null };
const MENTION_TRIGGER = /(?:^|\s)@([^\s@]*)$/;
const MAX_MENTION_SUGGESTIONS = 5;

/** The one contiguous region where `newText` differs from `oldText` (a single edit). */
function diffRange(oldText: string, newText: string) {
  let prefixLen = 0;
  while (prefixLen < oldText.length && prefixLen < newText.length && oldText[prefixLen] === newText[prefixLen]) {
    prefixLen++;
  }
  let suffixLen = 0;
  const maxSuffix = Math.min(oldText.length, newText.length) - prefixLen;
  while (suffixLen < maxSuffix && oldText[oldText.length - 1 - suffixLen] === newText[newText.length - 1 - suffixLen]) {
    suffixLen++;
  }
  const oldEditEnd = oldText.length - suffixLen;
  const newEditEnd = newText.length - suffixLen;
  return { editStart: prefixLen, oldEditEnd, delta: newEditEnd - oldEditEnd, newEditEnd };
}

/**
 * Port of the web MentionInput: a single-line input with "@ to mention" suggestions shown above
 * it. The caller owns the plain display text; this tracks caret position and resolved-mention
 * ranges, and builds the `@[Name](id)` markup only on demand via the handle.
 */
export const MentionInput = forwardRef<
  MentionInputHandle,
  {
    value: string;
    onChange: (value: string) => void;
    members: MentionMember[];
    excludeUserId?: string | null;
    allowEveryone?: boolean;
    placeholder?: string;
    maxLength?: number;
    onSubmitEditing?: () => void;
  }
>(function MentionInput({ value, onChange, members, excludeUserId, allowEveryone, placeholder, maxLength, onSubmitEditing }, ref) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>(undefined);
  const caretRef = useRef(0);
  const inputRef = useRef<TextInput>(null);
  const mentionsRef = useRef<ResolvedMention[]>([]);

  useImperativeHandle(
    ref,
    () => ({
      getMarkupValue: () => buildMentionMarkup(value, mentionsRef.current),
      reset: () => {
        mentionsRef.current = [];
      },
    }),
    [value],
  );

  const matches = useMemo(() => {
    if (mentionQuery === null) return [];
    const query = mentionQuery.toLowerCase();
    const memberMatches = members.filter((m) => m.id !== excludeUserId && m.name.toLowerCase().includes(query));
    const all = allowEveryone && EVERYONE_OPTION.name.includes(query) ? [EVERYONE_OPTION, ...memberMatches] : memberMatches;
    return all.slice(0, MAX_MENTION_SUGGESTIONS);
  }, [mentionQuery, members, excludeUserId, allowEveryone]);

  function handleChangeText(next: string) {
    const { editStart, oldEditEnd, delta, newEditEnd } = diffRange(value, next);
    mentionsRef.current = mentionsRef.current.flatMap((mention) => {
      if (mention.end <= editStart) return [mention];
      if (oldEditEnd <= mention.start) return [{ ...mention, start: mention.start + delta, end: mention.end + delta }];
      return []; // the edit touched this mention's text — it's no longer a mention
    });
    setSelection(undefined);
    onChange(next);
    // onSelectionChange fires after onChangeText on Android, so the caret is where this edit ended.
    caretRef.current = newEditEnd;
    const match = MENTION_TRIGGER.exec(next.slice(0, newEditEnd));
    setMentionQuery(match ? match[1] : null);
  }

  function handleSelectionChange(event: TextInputSelectionChangeEvent) {
    caretRef.current = event.nativeEvent.selection.end;
  }

  function selectMention(member: MentionMember) {
    const caret = caretRef.current;
    const match = MENTION_TRIGGER.exec(value.slice(0, caret));
    if (!match) return;
    const mentionStart = caret - match[1].length - 1;
    const label = `@${member.name}`;
    const inserted = `${label} `;
    const next = value.slice(0, mentionStart) + inserted + value.slice(caret);
    const delta = inserted.length - (caret - mentionStart);
    mentionsRef.current = [
      ...mentionsRef.current.map((m) => (m.start >= caret ? { ...m, start: m.start + delta, end: m.end + delta } : m)),
      { id: member.id, name: member.name, start: mentionStart, end: mentionStart + label.length },
    ];
    onChange(next);
    setMentionQuery(null);
    const cursor = mentionStart + inserted.length;
    caretRef.current = cursor;
    setSelection({ start: cursor, end: cursor });
    // Like the web's requestAnimationFrame + focus() after inserting: the tap on the suggestion
    // takes focus as it finishes, so refocusing has to wait a frame or it's immediately undone.
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <View className="relative min-w-0 flex-1">
      {focused && matches.length > 0 && (
        <View
          className="absolute bottom-full left-0 z-10 mb-1 w-56 overflow-hidden rounded-lg border border-surfaceBorder bg-surface"
          style={{ elevation: 8 }}
        >
          {matches.map((member) => (
            <Pressable key={member.id} onPress={() => selectMention(member)} className="flex-row items-center gap-2 px-3 py-2">
              {member.id === MENTION_EVERYONE_ID ? (
                <View className="h-5 w-5 items-center justify-center rounded-full bg-accent/15">
                  <Users size={12} color={colors.accent} />
                </View>
              ) : (
                <Avatar name={member.name} avatarUrl={member.avatarUrl} size={20} />
              )}
              <Text className="text-sm text-foregroundSecondary">{member.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        onSelectionChange={handleSelectionChange}
        selection={selection}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.foregroundMuted}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        maxLength={maxLength}
        returnKeyType="send"
        onSubmitEditing={onSubmitEditing}
        submitBehavior="submit"
        className={`w-full min-w-0 rounded-lg border bg-surface px-3 py-2 font-sans text-base text-foreground ${
          focused ? "border-accent" : "border-surfaceBorder"
        }`}
      />
    </View>
  );
});
