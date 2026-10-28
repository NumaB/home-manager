import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Member, MemberRole } from "@prisma/client";
import { MEMBER_ROLES_KEY } from "./auth.decorators";
import { RolesGuard } from "./roles.guard";

const user = {
  id: "member_1",
  clerkUserId: "user_1",
  role: MemberRole.USER,
  isActive: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
} satisfies Member;

function contextFor(member: Member | undefined, handler: () => void) {
  return {
    getHandler: () => handler,
    getClass: () => class TestController {},
    switchToHttp: () => ({ getRequest: () => ({ member }) }),
  } as unknown as ExecutionContext;
}

test("enforces administrator-only role metadata", () => {
  const handler = () => {};
  Reflect.defineMetadata(MEMBER_ROLES_KEY, [MemberRole.ADMIN], handler);
  const guard = new RolesGuard(new Reflector());

  assert.throws(
    () => guard.canActivate(contextFor(user, handler)),
    ForbiddenException,
  );
  assert.equal(
    guard.canActivate(contextFor({ ...user, role: MemberRole.ADMIN }, handler)),
    true,
  );
});

test("allows routes without role restrictions", () => {
  const guard = new RolesGuard(new Reflector());
  assert.equal(guard.canActivate(contextFor(user, () => {})), true);
});
