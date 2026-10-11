// An invite code from a link opened while signed out, held until sign-in finishes so the app can
// carry on to joining — like the web's /join, which sends you to sign-in and back.
let pendingInviteCode: string | null = null;

export function setPendingInvite(code: string) {
  pendingInviteCode = code;
}

/** Returns the waiting code once, then forgets it. */
export function takePendingInvite() {
  const code = pendingInviteCode;
  pendingInviteCode = null;
  return code;
}
