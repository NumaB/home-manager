import assert from "node:assert/strict";
import test from "node:test";
import { ReservationStatus, ReservationVoteChoice } from "@prisma/client";
import {
  approvalThreshold,
  countVotes,
  resolveVoteOutcome,
} from "./reservation-rules";

test("uses half rounded up as the approval threshold", () => {
  assert.equal(approvalThreshold(8), 4);
  assert.equal(approvalThreshold(7), 4);
  assert.equal(approvalThreshold(1), 1);
  assert.equal(approvalThreshold(0), 0);
});

test("counts only the fixed electorate and resolves approval or rejection", () => {
  const counts = countVotes([
    ReservationVoteChoice.APPROVE,
    ReservationVoteChoice.APPROVE,
    ReservationVoteChoice.REJECT,
    null,
  ]);
  assert.deepEqual(counts, { eligible: 4, approvals: 2, rejections: 1 });
  assert.equal(resolveVoteOutcome(counts), ReservationStatus.APPROVED);
  assert.equal(
    resolveVoteOutcome({ eligible: 4, approvals: 1, rejections: 2 }),
    "REJECTED",
  );
});

test("treats simultaneous thresholds after electorate shrink as rejection", () => {
  assert.equal(
    resolveVoteOutcome({ eligible: 4, approvals: 2, rejections: 2 }),
    "REJECTED",
  );
});

test("rejects a pending request if deactivation leaves no eligible voters", () => {
  assert.equal(
    resolveVoteOutcome({ eligible: 0, approvals: 0, rejections: 0 }),
    "REJECTED",
  );
});

test("does not resolve until one side reaches the threshold", () => {
  assert.equal(
    resolveVoteOutcome({ eligible: 7, approvals: 3, rejections: 3 }),
    null,
  );
});
