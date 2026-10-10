import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { toast } from "@/lib/toast";
import { savePreferences } from "../services/profile";
import type { ProfileResponse } from "../types";

type Preferences = NonNullable<ProfileResponse["notificationPreferences"]>;

const ROWS: { key: keyof Preferences; label: string }[] = [
  { key: "notifyOnComments", label: "Comments" },
  { key: "notifyOnMentions", label: "Mentions" },
  { key: "notifyOnReactions", label: "Reactions" },
  { key: "notifyOnCheckIns", label: "Check-ins" },
];

/** Port of the web NotificationPreferencesForm. */
export function NotificationPreferencesForm({ initial, onSaved }: { initial: Preferences; onSaved: () => void }) {
  const getToken = useApiToken();
  const [preferences, setPreferences] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleSave() {
    setPending(true);
    setError(false);
    try {
      await savePreferences(getToken, preferences);
      toast("Notification preferences saved");
      onSaved();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <View className="gap-2">
      <Text className="text-xs text-foregroundTertiary">Turns off push and email for these — the notification bell still shows them either way.</Text>
      {ROWS.map(({ key, label }) => (
        <Switch key={key} label={label} value={preferences[key]} onValueChange={(value) => setPreferences((prev) => ({ ...prev, [key]: value }))} />
      ))}
      {error && <Text className="text-sm text-danger">Couldn&apos;t save your preferences.</Text>}
      <Button title={pending ? "Saving..." : "Save preferences"} disabled={pending} onPress={handleSave} className="mt-2" />
    </View>
  );
}
