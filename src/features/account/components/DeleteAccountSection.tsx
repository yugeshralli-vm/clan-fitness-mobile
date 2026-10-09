import { useAuth } from "@clerk/expo";
import { useState } from "react";
import { View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { deleteMyAccount } from "../services/account";

const CONFIRMATION = "DELETE";

/** Port of the web DeleteAccountSection: danger button, then type DELETE to confirm in a sheet. */
export function DeleteAccountSection() {
  const getToken = useApiToken();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (typed.trim() !== CONFIRMATION || pending) return;
    setPending(true);
    setError(null);
    try {
      await deleteMyAccount(getToken);
      // The Clerk user no longer exists; clearing the local session sends the app to sign-in.
      await signOut().catch(() => {});
    } catch {
      setError("Couldn't finish deleting your account. Please try again.");
      setPending(false);
    }
  }

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold">Delete account</Text>
      <Text className="text-xs text-foregroundTertiary">
        Permanently deletes your account and everything in it. This can&apos;t be undone.
      </Text>
      <Button variant="danger" title="Delete account" onPress={() => setOpen(true)} />

      <BottomSheet open={open} onClose={() => !pending && setOpen(false)} title="Delete account">
        <View className="gap-3">
          <Text className="text-sm text-foregroundSecondary">
            This permanently deletes your account, check-ins, photos, comments, reactions, chat messages, points and
            notifications. Clans you run are handed to their longest-standing member; a clan with no one else in it is
            deleted.
          </Text>
          <Text className="text-sm font-medium">
            Type <Text className="text-sm font-semibold">{CONFIRMATION}</Text> to confirm
          </Text>
          <Input value={typed} onChangeText={setTyped} autoCapitalize="characters" autoCorrect={false} />
          {error && <Text className="text-sm text-danger">{error}</Text>}
          <Button
            variant="danger"
            title={pending ? "Deleting..." : "Delete my account"}
            onPress={handleDelete}
            disabled={pending || typed.trim() !== CONFIRMATION}
          />
        </View>
      </BottomSheet>
    </View>
  );
}
