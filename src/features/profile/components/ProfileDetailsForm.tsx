import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";
import { useApiToken } from "@/hooks/useApiToken";
import { apiErrorMessage } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { saveDetails } from "../services/profile";
import type { ProfileResponse } from "../types";

type Units = "metric" | "imperial";

const UNIT_OPTIONS: { value: Units; label: string }[] = [
  { value: "metric", label: "Metric (cm, kg)" },
  { value: "imperial", label: "Imperial (in, lb)" },
];

const GENDER_OPTIONS = [
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

const toNumber = (value: string) => (value.trim() ? Number(value) : null);

/**
 * Port of the web ProfileDetailsForm: units, height, weight (in the chosen units), date of birth,
 * gender and bio. Date of birth is typed as YYYY-MM-DD — the web's date input.
 */
export function ProfileDetailsForm({ details, onSaved }: { details: NonNullable<ProfileResponse["details"]>; onSaved: () => void }) {
  const getToken = useApiToken();
  const [units, setUnits] = useState<Units>(details.unitsPreference);
  const [height, setHeight] = useState(details.height?.toString() ?? "");
  const [weight, setWeight] = useState(details.weight?.toString() ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(details.dateOfBirth ?? "");
  const [gender, setGender] = useState(details.gender ?? "prefer_not_to_say");
  const [bio, setBio] = useState(details.bio ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setPending(true);
    setError(null);
    try {
      await saveDetails(getToken, {
        unitsPreference: units,
        height: toNumber(height),
        weight: toNumber(weight),
        dateOfBirth: dateOfBirth.trim() || null,
        gender,
        bio: bio.trim() || null,
      });
      toast("Profile details saved");
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't save your details."));
    } finally {
      setPending(false);
    }
  }

  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="text-sm font-medium">Units</Text>
        <Select title="Units" value={units} options={UNIT_OPTIONS} onChange={setUnits} />
      </View>
      <View className="gap-2">
        <Text className="text-sm font-medium">Height ({units === "metric" ? "cm" : "in"})</Text>
        <Input value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
      </View>
      <View className="gap-2">
        <Text className="text-sm font-medium">Weight ({units === "metric" ? "kg" : "lb"})</Text>
        <Input value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
      </View>
      <View className="gap-2">
        <Text className="text-sm font-medium">Date of birth</Text>
        <Input value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" maxLength={10} />
      </View>
      <View className="gap-2">
        <Text className="text-sm font-medium">Gender</Text>
        <Select title="Gender" value={gender} options={GENDER_OPTIONS} onChange={setGender} />
      </View>
      <View className="gap-2">
        <Text className="text-sm font-medium">Bio</Text>
        <Input
          value={bio}
          onChangeText={setBio}
          maxLength={200}
          multiline
          numberOfLines={3}
          placeholder="A short intro for your clan"
          style={{ minHeight: 88, textAlignVertical: "top" }}
        />
      </View>
      {error && <Text className="text-sm text-danger">{error}</Text>}
      <Button title={pending ? "Saving..." : "Save details"} disabled={pending} onPress={handleSave} />
    </View>
  );
}
