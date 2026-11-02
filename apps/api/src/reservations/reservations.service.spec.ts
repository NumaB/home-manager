import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException } from "@nestjs/common";
import type { Member } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { ReservationsService } from "./reservations.service";

const reservation = {
  id: "reservation-1",
  creatorId: "creator-1",
  reservedForId: "member-1",
  startDate: new Date("2026-06-01T00:00:00.000Z"),
  endDate: new Date("2026-06-03T00:00:00.000Z"),
  title: null,
  description: null,
  status: "APPROVED",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  creator: {
    id: "creator-1",
    displayName: "Creator",
    reservationColor: "#000000",
  },
  reservedFor: {
    id: "member-1",
    displayName: "Member",
    reservationColor: "#FFFFFF",
  },
  voters: [],
};

function createService() {
  const tx = {
    reservation: {
      findUnique: async () => reservation,
      findUniqueOrThrow: async () => reservation,
      delete: async () => reservation,
    },
    bookingSettings: {
      upsert: async () => ({ approvalEnabled: false }),
    },
  };
  const prisma = {
    $transaction: async (operation: (transaction: typeof tx) => unknown) =>
      operation(tx),
  };
  return new ReservationsService(prisma as unknown as PrismaService);
}

const member = (id: string) => ({ id }) as Member;

test("the creator and the member a reservation is for can edit it", async () => {
  const service = createService();
  for (const id of ["creator-1", "member-1"]) {
    const result = await service.updateDates(
      reservation.id,
      member(id),
      "2026-06-01",
      "2026-06-03",
    );
    assert.equal(result.id, reservation.id);
  }
});

test("other members cannot edit a reservation", async () => {
  await assert.rejects(
    createService().updateDates(
      reservation.id,
      member("other-member"),
      "2026-06-01",
      "2026-06-03",
    ),
    ForbiddenException,
  );
});

test("the creator and the member a reservation is for can cancel it", async () => {
  for (const id of ["creator-1", "member-1"]) {
    await createService().cancel(reservation.id, member(id));
  }
});

test("other members cannot cancel a reservation", async () => {
  await assert.rejects(
    createService().cancel(reservation.id, member("other-member")),
    ForbiddenException,
  );
});
