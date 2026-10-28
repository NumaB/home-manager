import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Member, MemberRole } from "@prisma/client";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { IS_PUBLIC_KEY } from "./auth.decorators";
import { ClerkTokenVerifier } from "./clerk-token-verifier.service";
import { MemberService } from "./member.service";

const activeMember = {
  id: "member_1",
  clerkUserId: "user_1",
  role: MemberRole.USER,
  isActive: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
} satisfies Member;

function createContext(
  authorization?: string,
  handler: (...args: never[]) => void = () => {},
): {
  context: ExecutionContext;
  request: { headers: { authorization?: string }; member?: Member };
} {
  const request: { headers: { authorization?: string }; member?: Member } = {
    headers: { authorization },
  };
  const context = {
    getHandler: () => handler,
    getClass: () => class TestController {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

function createGuard(
  verifySessionToken: (token: string) => Promise<string>,
  getOrCreate: (clerkUserId: string) => Promise<Member>,
) {
  return new ClerkAuthGuard(
    new Reflector(),
    { verifySessionToken } as ClerkTokenVerifier,
    { getOrCreate } as MemberService,
  );
}

test("rejects requests without a bearer session token", async () => {
  const guard = createGuard(
    async () => "user_1",
    async () => activeMember,
  );
  const { context } = createContext();

  await assert.rejects(guard.canActivate(context), UnauthorizedException);
});

test("rejects invalid Clerk tokens without creating a member", async () => {
  let provisioned = false;
  const guard = createGuard(
    async () => {
      throw new Error("invalid token");
    },
    async () => {
      provisioned = true;
      return activeMember;
    },
  );
  const { context } = createContext("Bearer invalid");

  await assert.rejects(guard.canActivate(context), UnauthorizedException);
  assert.equal(provisioned, false);
});

test("attaches the provisioned application member to a valid request", async () => {
  let verifiedToken = "";
  let provisionedUser = "";
  const guard = createGuard(
    async (token) => {
      verifiedToken = token;
      return "user_1";
    },
    async (clerkUserId) => {
      provisionedUser = clerkUserId;
      return activeMember;
    },
  );
  const { context, request } = createContext("Bearer signed.jwt.token");

  assert.equal(await guard.canActivate(context), true);
  assert.equal(verifiedToken, "signed.jwt.token");
  assert.equal(provisionedUser, "user_1");
  assert.equal(request.member, activeMember);
});

test("blocks a disabled application member", async () => {
  const disabledMember = { ...activeMember, isActive: false };
  const guard = createGuard(
    async () => "user_1",
    async () => disabledMember,
  );
  const { context } = createContext("Bearer signed.jwt.token");

  await assert.rejects(guard.canActivate(context), ForbiddenException);
});

test("allows explicitly public routes without a bearer token", async () => {
  const publicHandler = () => {};
  Reflect.defineMetadata(IS_PUBLIC_KEY, true, publicHandler);
  const guard = createGuard(
    async () => "user_1",
    async () => activeMember,
  );
  const { context } = createContext(undefined, publicHandler);

  assert.equal(await guard.canActivate(context), true);
});
