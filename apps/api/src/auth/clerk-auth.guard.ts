import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Member } from "@prisma/client";
import { IS_PUBLIC_KEY } from "./auth.decorators";
import { ClerkTokenVerifier } from "./clerk-token-verifier.service";
import { MemberService } from "./member.service";

type AuthenticatedRequest = {
  headers: { authorization?: string };
  member?: Member;
};

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(ClerkTokenVerifier)
    private readonly tokenVerifier: ClerkTokenVerifier,
    @Inject(MemberService) private readonly members: MemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) throw new UnauthorizedException();

    let clerkUserId: string;
    try {
      clerkUserId = await this.tokenVerifier.verifySessionToken(match[1]);
    } catch {
      throw new UnauthorizedException("Invalid or expired Clerk session");
    }

    const member = await this.members.getOrCreate(clerkUserId);
    if (!member.isActive) {
      throw new ForbiddenException("This application account is disabled");
    }

    request.member = member;
    return true;
  }
}
