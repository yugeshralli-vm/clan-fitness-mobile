import { Share } from "react-native";
import { Button } from "@/components/ui/Button";

const WEB_ORIGIN = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * Port of the web ShareInviteButton — the native share sheet, which is what the web shows wherever
 * navigator.share exists (it does on Android). Shares the web invite link, which works for PWA users
 * and app users alike.
 */
export function ShareInviteButton({ inviteCode, clanName }: { inviteCode: string; clanName: string }) {
  function handleShare() {
    const url = `${WEB_ORIGIN}/join?code=${inviteCode}`;
    Share.share({ title: "Clan Fitness invite", message: `Join my clan "${clanName}" on Clan Fitness! ${url}` }).catch(() => {});
  }
  return <Button variant="secondary" title="Share invite" onPress={handleShare} />;
}
