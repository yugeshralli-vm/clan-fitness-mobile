export type ContractTier = 1 | 2 | 3;

/** One contract on today's board, as the web's getContractBoard returns it. */
export type ContractBoardEntry = {
  contract: { id: string; tier: ContractTier; title: string; description: string; points: number };
  claim: {
    userId: string;
    userName: string;
    userAvatarUrl: string | null;
    status: "claimed" | "completed" | "failed";
    opponentName?: string;
    duelSteps?: { claimant: number; opponent: number };
  } | null;
  targetSteps?: number;
};

export type LiveClaimProgress = { claimId: string; contractId: string; userId: string; title: string; points: number; completed: boolean };

export type ContractsResponse = { board: ContractBoardEntry[]; liveProgress: LiveClaimProgress[]; maxClaimsPerMemberPerDay: number };

export type ClaimResponse = { board: ContractBoardEntry[]; justCompleted?: { claimId: string; title: string; points: number } };
