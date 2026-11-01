import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { getInitialDisplayName, MemberService } from "./member.service";
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

test("initial display names prefer first name and fall back to email", () => {
  assert.equal(
    getInitialDisplayName("Camille", "camille@example.com"),
    "Camille",
  );
  assert.equal(
    getInitialDisplayName("  ", "camille@example.com"),
    "camille@example.com",
  );
});

test("member display names are validated, trimmed, and marked initialized", async () => {
  let updateData: Record<string, unknown> | undefined;
  const prisma = {
    member: {
      update: async (args: { data: Record<string, unknown> }) => {
        updateData = args.data;
        return args.data;
      },
    },
  } as unknown as PrismaService;
  const members = new MemberService(prisma);

  await assert.rejects(
    members.updateDisplayName("member-id", "  "),
    BadRequestException,
  );
  await assert.rejects(
    members.updateDisplayName("member-id", "x".repeat(81)),
    BadRequestException,
  );
  await members.updateDisplayName("member-id", " Camille ");

  assert.deepEqual(updateData, {
    displayName: "Camille",
    displayNameInitialized: true,
  });
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
