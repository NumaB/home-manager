import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { AuthController } from "./auth.controller";
import { ClerkTokenVerifier } from "./clerk-token-verifier.service";
import { MemberService } from "./member.service";
import { RolesGuard } from "./roles.guard";

@Module({
  controllers: [AuthController],
  providers: [
    ClerkTokenVerifier,
    MemberService,
    RolesGuard,
    { provide: APP_GUARD, useClass: ClerkAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [MemberService],
})
export class AuthModule {}
