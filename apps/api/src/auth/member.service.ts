import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MemberService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /**
   * A valid Clerk session can only be issued after the invite-only Clerk
   * instance admits the identity. New identities receive the least-privileged
   * application role; existing role assignments are never overwritten here.
   */
  getOrCreate(clerkUserId: string) {
    return this.prisma.member.upsert({
      where: { clerkUserId },
      update: {},
      create: { clerkUserId },
    });
  }
}
