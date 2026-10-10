import { useIsOnline } from "@/features/realtime";
import { Avatar } from "./Avatar";

/** Avatar with the live green dot while `userId` has the app open (presence from the realtime server). */
export function OnlineAvatar({ userId, ...props }: { userId: string; name: string; avatarUrl: string | null; size?: number }) {
  return <Avatar {...props} online={useIsOnline(userId)} />;
}
