import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { MemberService } from "./member.service";
import { RESERVATION_COLORS } from "./reservation-colors";

test("new members receive a color from the predefined palette", async () => {
  let createData: Record<string, unknown> | undefined;
  const prisma = {
    member: {
      upsert: async (args: { create: Record<string, unknown> }) => {
        createData = args.create;
        return args.create;
      },
    },
  } as unknown as PrismaService;

  await new MemberService(prisma).getOrCreate("clerk-user-id");

  assert.ok(
    RESERVATION_COLORS.includes(
      createData?.reservationColor as (typeof RESERVATION_COLORS)[number],
    ),
  );
});

test("member reservation colors are validated and normalized", async () => {
  let updatedColor = "";
  const prisma = {
    member: {
      update: async (args: { data: { reservationColor: string } }) => {
        updatedColor = args.data.reservationColor;
        return { reservationColor: updatedColor };
      },
    },
  } as unknown as PrismaService;
  const members = new MemberService(prisma);

  await assert.rejects(
    members.updateReservationColor("member-id", "not-a-color"),
    BadRequestException,
  );
  await members.updateReservationColor("member-id", "#a1b2c3");

  assert.equal(updatedColor, "#A1B2C3");
});
