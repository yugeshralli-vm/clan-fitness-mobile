import { ChevronRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Avatar } from "@/components/shared/Avatar";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { OnlineAvatar } from "@/components/shared/OnlineAvatar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { apiErrorMessage } from "@/lib/api-error";
import { colors } from "@/styles/tokens";
import { leaveClan, makeAdmin, nudgeMember, removeMember } from "../services/clans";
import type { ClanDetail } from "../types";

type Member = ClanDetail["members"][number];
/** Which sheet a row opens — the web's MemberActionsSheet / LeaveClanSheet / NudgeSheet, or none. */
type RowKind = "actions" | "leave" | "nudge" | "plain";

/**
 * Port of the web ClanMembersSection: each member with level, Admin tag and whether they've logged
 * today. The admin can open anyone else for nudge / make admin / remove; you can open your own row
 * to leave (unless you're the admin); and once you've logged, anyone who hasn't can be nudged.
 */
export function ClanMembersSection({
  clanId,
  detail,
  currentUserId,
  onChanged,
  onLeft,
  onOpenMember,
}: {
  clanId: string;
  detail: ClanDetail;
  currentUserId: string | undefined;
  onChanged: () => void;
  onLeft: () => void;
  onOpenMember?: (userId: string) => void;
}) {
  const isAdmin = detail.role === "admin";
  const me = detail.members.find((m) => m.id === currentUserId);
  const canNudge = (member: Member) => member.id !== currentUserId && !member.loggedToday && !!me?.loggedToday;

  function kindOf(member: Member): RowKind {
    if (isAdmin && member.role !== "admin") return "actions";
    if (member.id === currentUserId && member.role !== "admin") return "leave";
    if (canNudge(member)) return "nudge";
    return "plain";
  }

  return (
    <View className="gap-1 rounded-xl border border-surfaceBorder bg-surface p-5">
      <Text className="mb-2 font-semibold">Members</Text>
      {detail.members.map((member, i) => (
        <View
          key={member.id}
          className={`${i > 0 ? "border-t border-surfaceBorder pt-3" : ""} ${i < detail.members.length - 1 ? "pb-3" : ""}`}
        >
          <MemberRow
            clanId={clanId}
            member={member}
            kind={kindOf(member)}
            canNudge={canNudge(member)}
            onChanged={onChanged}
            onLeft={onLeft}
            onOpenMember={onOpenMember}
          />
        </View>
      ))}
    </View>
  );
}

function MemberRow({
  clanId,
  member,
  kind,
  canNudge,
  onChanged,
  onLeft,
  onOpenMember,
}: {
  clanId: string;
  member: Member;
  kind: RowKind;
  canNudge: boolean;
  onChanged: () => void;
  onLeft: () => void;
  onOpenMember?: (userId: string) => void;
}) {
  const getToken = useApiToken();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Like the web: "Nudged! 👋" shows briefly, then the sheet closes.
  useEffect(() => {
    if (!nudged) return;
    const timeout = setTimeout(() => setOpen(false), 1200);
    return () => clearTimeout(timeout);
  }, [nudged]);

  async function run(action: () => Promise<unknown>, fallback: string, after?: () => void) {
    setPending(true);
    setError(null);
    try {
      await action();
      after?.();
    } catch (err) {
      setError(apiErrorMessage(err, fallback));
    } finally {
      setPending(false);
    }
  }

  const status = (
    <Text className={`text-xs ${member.loggedToday ? "text-foregroundTertiary" : "text-danger"}`}>
      {member.loggedToday ? "Logged today" : "Not logged yet"}
    </Text>
  );
  const nameLine = (
    <View className="min-w-0 flex-row items-center gap-1.5">
      <Text numberOfLines={1} className="shrink text-sm">
        {member.name}
      </Text>
      <LevelBadge level={member.level} />
      {kind === "plain" && member.role === "admin" && (
        <View className="rounded bg-background px-1.5 py-0.5">
          <Text className="text-xs text-foregroundTertiary">Admin</Text>
        </View>
      )}
    </View>
  );
  const avatar = (
    <Pressable onPress={() => onOpenMember?.(member.id)} disabled={!onOpenMember} className="shrink-0">
      {kind === "nudge" || kind === "plain" ? (
        <OnlineAvatar userId={member.id} name={member.name} avatarUrl={member.avatarUrl} />
      ) : (
        <Avatar name={member.name} avatarUrl={member.avatarUrl} />
      )}
    </Pressable>
  );

  if (kind === "plain") {
    return (
      <View className="min-w-0 flex-row items-center gap-3">
        {avatar}
        <View className="min-w-0 flex-1">
          {nameLine}
          {status}
        </View>
      </View>
    );
  }

  const nudgeButton = (
    <Button
      variant="secondary"
      title={nudged ? "Nudged! 👋" : pending ? "Sending..." : kind === "nudge" ? "Send nudge" : "Nudge to log"}
      disabled={pending || nudged}
      onPress={() => run(() => nudgeMember(getToken, clanId, member.id), "Couldn't send that nudge.", () => setNudged(true))}
    />
  );

  return (
    <>
      <View className="min-w-0 flex-row items-center gap-3">
        {avatar}
        <Pressable
          onPress={() => {
            setError(null);
            setOpen(true);
          }}
          className="min-w-0 flex-1 flex-row items-center gap-3"
        >
          <View className="min-w-0 flex-1">
            {nameLine}
            {kind === "nudge" ? <Text className="text-xs text-danger">Not logged yet</Text> : status}
          </View>
          <ChevronRight size={16} color={colors.foregroundMuted} />
        </Pressable>
      </View>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={kind === "leave" ? "You" : kind === "nudge" ? "Nudge" : "Member"}>
        <View className="gap-6">
          <Pressable
            onPress={() => {
              setOpen(false);
              onOpenMember?.(member.id);
            }}
            disabled={!onOpenMember}
            className="flex-row items-center gap-3"
          >
            <Avatar name={member.name} avatarUrl={member.avatarUrl} size={48} />
            <View className="min-w-0 flex-row items-center gap-1.5">
              <Text numberOfLines={1} className="shrink text-lg font-semibold">
                {member.name}
              </Text>
              <LevelBadge level={member.level} />
            </View>
          </Pressable>

          {kind === "nudge" && nudgeButton}

          {kind === "actions" && (
            <View className="gap-2">
              {canNudge && nudgeButton}
              <Button
                variant="secondary"
                title="Make admin"
                disabled={pending}
                onPress={() =>
                  run(() => makeAdmin(getToken, clanId, member.id), "Couldn't make them admin.", () => {
                    setOpen(false);
                    onChanged();
                  })
                }
              />
              <Button
                variant="danger"
                title="Remove from clan"
                disabled={pending}
                onPress={() =>
                  Alert.alert("Remove member", `Remove ${member.name} from the clan?`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Remove",
                      style: "destructive",
                      onPress: () =>
                        run(() => removeMember(getToken, clanId, member.id), "Couldn't remove them.", () => {
                          setOpen(false);
                          onChanged();
                        }),
                    },
                  ])
                }
              />
            </View>
          )}

          {kind === "leave" && (
            <Button
              variant="danger"
              title="Leave clan"
              disabled={pending}
              onPress={() =>
                Alert.alert("Leave clan", "Leave this clan? You'll need an invite to rejoin.", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Leave",
                    style: "destructive",
                    onPress: () =>
                      run(() => leaveClan(getToken, clanId), "Couldn't leave the clan.", () => {
                        setOpen(false);
                        onLeft();
                      }),
                  },
                ])
              }
            />
          )}
          {error && <Text className="text-sm text-danger">{error}</Text>}
        </View>
      </BottomSheet>
    </>
  );
}
