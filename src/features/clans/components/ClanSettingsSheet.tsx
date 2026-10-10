import { RefreshCw, Settings } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { apiErrorMessage } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { colors } from "@/styles/tokens";
import { deleteClan, regenerateInviteCode, renameClan } from "../services/clans";
import { ShareInviteButton } from "./ShareInviteButton";

/**
 * Port of the web ClanSettingsSheet (admin only): the gear opens "Clan settings" with the invite
 * code, Share invite and regenerate; rename; and the danger zone to delete the clan.
 */
export function ClanSettingsSheet({
  clanId,
  clanName,
  inviteCode,
  memberCount,
  onChanged,
  onDeleted,
}: {
  clanId: string;
  clanName: string;
  inviteCode: string;
  memberCount: number;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const getToken = useApiToken();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(clanName);
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleOpen() {
    setName(clanName);
    setRenameError(null);
    setConfirming(false);
    setConfirmName("");
    setDeleteError(null);
    setOpen(true);
  }


  async function handleRegenerate() {
    setRegenerating(true);
    try {
      await regenerateInviteCode(getToken, clanId);
      onChanged();
    } catch {
      toast("Couldn't regenerate the invite code.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleRename() {
    setRenaming(true);
    setRenameError(null);
    try {
      await renameClan(getToken, clanId, name);
      toast("Clan renamed");
      onChanged();
    } catch (err) {
      setRenameError(apiErrorMessage(err, "Couldn't rename the clan."));
    } finally {
      setRenaming(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteClan(getToken, clanId, confirmName);
      setOpen(false);
      onDeleted();
    } catch (err) {
      setDeleteError(apiErrorMessage(err, "Couldn't delete the clan."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Pressable onPress={handleOpen} accessibilityLabel="Clan settings" className="-m-2.5 p-2.5">
        <Settings size={20} color={colors.foregroundTertiary} />
      </Pressable>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Clan settings">
        <View className="gap-6">
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foregroundSecondary">Invite people</Text>
            <Text className="text-sm text-foregroundTertiary">
              Invite code: <Text style={{ fontFamily: "monospace" }} className="text-sm">{inviteCode}</Text>
            </Text>
            <View className="flex-row items-center gap-2">
              <ShareInviteButton inviteCode={inviteCode} clanName={clanName} />
              <Button
                variant="secondary"
                icon={RefreshCw}
                accessibilityLabel="Regenerate invite code"
                disabled={regenerating}
                onPress={handleRegenerate}
              />
            </View>
            <Text className="text-xs text-foregroundMuted">Old links and codes stop working once you regenerate.</Text>
          </View>

          <View className="gap-3 border-t border-surfaceBorder pt-4">
            <Text className="text-sm font-semibold text-foregroundSecondary">Rename clan</Text>
            <View className="gap-2">
              <Text className="text-sm font-medium">Clan name</Text>
              <Input value={name} onChangeText={setName} maxLength={60} />
              {renameError && <Text className="text-sm text-danger">{renameError}</Text>}
              <Button variant="secondary" title={renaming ? "Saving..." : "Rename clan"} disabled={renaming} onPress={handleRename} />
            </View>
          </View>

          <View className="gap-3 border-t border-surfaceBorder pt-4">
            <Text className="text-sm font-semibold text-danger">Danger zone</Text>
            {!confirming ? (
              <View className="self-start">
                <Button variant="danger" title="Delete clan" onPress={() => setConfirming(true)} />
              </View>
            ) : (
              <View className="gap-3">
                <Text className="text-sm text-foregroundSecondary">
                  This permanently deletes {clanName} for {memberCount === 1 ? "just you" : `all ${memberCount} members`}. Everyone&apos;s
                  reactions and comments in this clan are removed. Check-ins themselves aren&apos;t affected — they stay in each
                  member&apos;s own history.
                </Text>
                <View className="gap-1">
                  <Text className="text-sm font-medium">
                    Type <Text className="text-sm font-semibold">{clanName}</Text> to confirm
                  </Text>
                  <Input value={confirmName} onChangeText={setConfirmName} autoCapitalize="none" autoCorrect={false} />
                </View>
                {deleteError && <Text className="text-sm text-danger">{deleteError}</Text>}
                <View className="flex-row gap-2">
                  <Button variant="danger" title={deleting ? "Deleting..." : "Delete clan"} disabled={deleting} onPress={handleDelete} />
                  <Button variant="secondary" title="Cancel" onPress={() => setConfirming(false)} />
                </View>
              </View>
            )}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
