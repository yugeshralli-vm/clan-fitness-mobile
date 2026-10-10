import { useLocalSearchParams } from "expo-router";
import { ContractsScreen } from "@/features/contracts";

/** Web /clans/[clanId]/contracts. */
export default function ContractsRoute() {
  const { clanId } = useLocalSearchParams<{ clanId: string }>();
  return <ContractsScreen clanId={clanId} />;
}
