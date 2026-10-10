/** What a reaction or comment is on: a member's day card (its anchor check-in) or a weekly recap. */
export type FeedTarget = { checkInId: string } | { systemPostId: string };

export function feedTargetKey(target: FeedTarget) {
  return "checkInId" in target ? target.checkInId : target.systemPostId;
}
