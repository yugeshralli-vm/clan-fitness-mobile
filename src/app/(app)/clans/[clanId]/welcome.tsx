import { useLocalSearchParams } from "expo-router";
import { ClanWelcomeScreen } from "@/features/clans";

/** Web /clans/[clanId]/welcome. */
export default function WelcomeRoute() {
  const { clanId } = useLocalSearchParams<{ clanId: string }>();
  return <ClanWelcomeScreen clanId={clanId} />;
}
