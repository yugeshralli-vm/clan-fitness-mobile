import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { apiErrorMessage } from "@/lib/api-error";
import { useActiveClan } from "../ActiveClanProvider";
import { createClan, joinClan } from "../services/clans";

/** After creating or joining: reload your clans, make the new one active, then go where the web goes. */
function useEnterClan() {
  const router = useRouter();
  const { refresh, setActiveClanId } = useActiveClan();
  return async (clanId: string, welcome: boolean) => {
    await refresh();
    setActiveClanId(clanId);
    if (welcome) router.replace({ pathname: "/clans/[clanId]/welcome", params: { clanId } });
    else router.navigate("/");
  };
}

/** Port of the web CreateClanForm. */
export function CreateClanForm() {
  const getToken = useApiToken();
  const enterClan = useEnterClan();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setPending(true);
    setError(null);
    try {
      const { clanId } = await createClan(getToken, name, description);
      await enterClan(clanId, true);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't create the clan."));
    } finally {
      setPending(false);
    }
  }

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-sm font-medium">Clan name</Text>
        <Input value={name} onChangeText={setName} maxLength={60} placeholder="Gym Rats" />
      </View>
      <View className="gap-1">
        <Text className="text-sm font-medium">Description (optional)</Text>
        <Input value={description} onChangeText={setDescription} placeholder="Accountability crew" />
      </View>
      <Text className="text-xs text-foregroundTertiary">You&apos;ll get an invite link to share with your group right after this.</Text>
      {error && <Text className="text-sm text-danger">{error}</Text>}
      <Button title={pending ? "Creating..." : "Create clan"} disabled={pending} onPress={handleCreate} />
    </View>
  );
}

/** Port of the web JoinClanForm. Already a member: straight to that clan's feed, as the web does. */
export function JoinClanForm({ defaultInviteCode }: { defaultInviteCode?: string }) {
  const getToken = useApiToken();
  const enterClan = useEnterClan();
  const [code, setCode] = useState(defaultInviteCode ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setPending(true);
    setError(null);
    try {
      const { clanId, alreadyMember } = await joinClan(getToken, code);
      await enterClan(clanId, !alreadyMember);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't join the clan."));
    } finally {
      setPending(false);
    }
  }

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-sm font-medium">Invite code</Text>
        <Input value={code} onChangeText={setCode} placeholder="e.g. Xk9mQ2pR7T" autoCapitalize="none" autoCorrect={false} />
      </View>
      {error && <Text className="text-sm text-danger">{error}</Text>}
      <Button title={pending ? "Joining..." : "Join clan"} disabled={pending} onPress={handleJoin} />
    </View>
  );
}
