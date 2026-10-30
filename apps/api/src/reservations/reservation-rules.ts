import { ReservationStatus, ReservationVoteChoice } from "@prisma/client";

export type VoteCounts = {
  eligible: number;
  approvals: number;
  rejections: number;
};

export function approvalThreshold(eligibleVoters: number): number {
  return Math.ceil(eligibleVoters / 2);
}

export function resolveVoteOutcome(
  counts: VoteCounts,
): ReservationStatus | "REJECTED" | null {
  const threshold = approvalThreshold(counts.eligible);
  // If deactivation empties the electorate, both zero-vote thresholds are
  // reached; reject rather than leave a request pending without voters.
  if (threshold === 0) return "REJECTED";
  // A member deactivation can shrink the electorate enough for both sides to
  // reach the threshold at once. Treat that tie as a rejection (fail closed).
  if (counts.rejections >= threshold) return "REJECTED";
  if (counts.approvals >= threshold) return ReservationStatus.APPROVED;
  return null;
}

export function countVotes(
  choices: readonly (ReservationVoteChoice | null)[],
): VoteCounts {
  return {
    eligible: choices.length,
    approvals: choices.filter(
      (choice) => choice === ReservationVoteChoice.APPROVE,
    ).length,
    rejections: choices.filter(
      (choice) => choice === ReservationVoteChoice.REJECT,
    ).length,
  };
}
