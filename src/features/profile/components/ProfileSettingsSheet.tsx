import { useAuth } from "@clerk/expo";
import { useState } from "react";
import { View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Text } from "@/components/ui/Text";
import { DeleteAccountSection } from "@/features/account";
import { disablePush, PushNotificationManager } from "@/features/push";
import { useApiToken } from "@/hooks/useApiToken";
import type { ProfileResponse } from "../types";
import { GoalsForm } from "./GoalsForm";
import { NotificationPreferencesForm } from "./NotificationPreferencesForm";
import { ProfileDetailsForm } from "./ProfileDetailsForm";

/**
 * Port of the web ProfileSettingsSheet: "Edit profile" opens Goals / Details / Settings tabs.
 * Settings has push setup, notification preferences and account deletion like the web, plus Sign
 * out — which the web has in Clerk's avatar menu.
 */
export function ProfileSettingsSheet({ profile, onSaved }: { profile: ProfileResponse; onSaved: () => void }) {
  const { signOut } = useAuth();
  const getToken = useApiToken();
  const [open, setOpen] = useState(false);
  const { goals, details, notificationPreferences } = profile;
  if (!details || !notificationPreferences) return null;

  return (
    <>
      <Button variant="secondary" title="Edit profile" onPress={() => setOpen(true)} />
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Edit profile">
        <Tabs
          tabs={[
            {
              id: "goals",
              label: "Goals",
              content: <GoalsForm gymTarget={goals?.gymDaysPerWeek ?? undefined} stepsTarget={goals?.stepsPerDay ?? undefined} onSuccess={onSaved} />,
            },
            {
              id: "details",
              label: "Details",
              content: (
                <>
                  <Text className="text-xs text-foregroundTertiary">Only visible to you.</Text>
                  {(details.age !== null || details.bmi !== null) && (
                    <Text className="text-sm text-foregroundSecondary">
                      {details.age !== null && `Age ${details.age}`}
                      {details.age !== null && details.bmi !== null && " · "}
                      {details.bmi !== null && `BMI ${details.bmi.toFixed(1)}`}
                    </Text>
                  )}
                  <ProfileDetailsForm details={details} onSaved={onSaved} />
                </>
              ),
            },
            {
              id: "settings",
              label: "Settings",
              content: (
                <>
                  <PushNotificationManager />
                  <View className="h-px bg-surfaceBorder" />
                  <NotificationPreferencesForm initial={notificationPreferences} onSaved={onSaved} />
                  <View className="h-px bg-surfaceBorder" />
                  <Button
                    variant="secondary"
                    title="Sign out"
                    // Stop this phone getting the account's notifications once it's signed out.
                    onPress={async () => {
                      await disablePush(getToken);
                      await signOut();
                    }}
                  />
                  <View className="h-px bg-surfaceBorder" />
                  <DeleteAccountSection />
                </>
              ),
            },
          ]}
        />
      </BottomSheet>
    </>
  );
}
