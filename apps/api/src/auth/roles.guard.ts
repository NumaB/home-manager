import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Member, MemberRole } from "@prisma/client";
import { MEMBER_ROLES_KEY } from "./auth.decorators";

type AuthenticatedRequest = {
  member?: Member;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      MEMBER_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.member || !requiredRoles.includes(request.member.role)) {
      throw new ForbiddenException("Insufficient application role");
    }

    return true;
  }
}
