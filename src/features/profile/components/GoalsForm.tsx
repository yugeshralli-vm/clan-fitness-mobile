import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { apiErrorMessage } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { saveGoals } from "../services/profile";

/** Port of the web GoalsForm: gym days per week (4 by default) and steps per day (8000), Save goals. */
export function GoalsForm({ gymTarget, stepsTarget, onSuccess }: { gymTarget?: number; stepsTarget?: number; onSuccess?: () => void }) {
  const getToken = useApiToken();
  const [days, setDays] = useState(String(gymTarget ?? 4));
  const [steps, setSteps] = useState(String(stepsTarget ?? 8000));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setPending(true);
    setError(null);
    try {
      await saveGoals(getToken, Number(days), Number(steps));
      toast("Goals saved");
      onSuccess?.();
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't save your goals."));
    } finally {
      setPending(false);
    }
  }

  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="text-sm font-medium">Gym days per week</Text>
        <Input value={days} onChangeText={setDays} keyboardType="number-pad" maxLength={1} />
      </View>
      <View className="gap-2">
        <Text className="text-sm font-medium">Steps per day</Text>
        <Input value={steps} onChangeText={setSteps} keyboardType="number-pad" maxLength={6} />
      </View>
      {error && <Text className="text-sm text-danger">{error}</Text>}
      <Button title={pending ? "Saving..." : "Save goals"} disabled={pending} onPress={handleSave} />
    </View>
  );
}
