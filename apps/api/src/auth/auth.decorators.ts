import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import type { Member, MemberRole } from "@prisma/client";

type AuthenticatedRequest = {
  member?: Member;
};

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const MEMBER_ROLES_KEY = "memberRoles";
export const RequireRoles = (...roles: MemberRole[]) =>
  SetMetadata(MEMBER_ROLES_KEY, roles);

export const CurrentMember = createParamDecorator(
  (_: unknown, context: ExecutionContext): Member => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.member) {
      throw new Error("CurrentMember can only be used on authenticated routes");
    }
    return request.member;
  },
);
