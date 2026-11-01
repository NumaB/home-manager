import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { createClerkClient } from "@clerk/backend";
import type { Member } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { randomReservationColor } from "./reservation-colors";

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
      create: {
        clerkUserId,
        reservationColor: randomReservationColor(),
      },
    });
  }

  async updateReservationColor(
    memberId: string,
    colorInput: unknown,
  ): Promise<Member> {
    if (
      typeof colorInput !== "string" ||
      !/^#[0-9A-Fa-f]{6}$/.test(colorInput)
    ) {
      throw new BadRequestException("reservationColor must be a hex color");
    }
    return this.prisma.member.update({
      where: { id: memberId },
      data: { reservationColor: colorInput.toUpperCase() },
    });
  }

  async syncDisplayName(member: Member): Promise<Member> {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) return member;
    try {
      const clerk = createClerkClient({ secretKey });
      const user = await clerk.users.getUser(member.clerkUserId);
      const displayName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        user.primaryEmailAddress?.emailAddress ||
        "Membre";
      if (displayName === member.displayName) return member;
      return await this.prisma.member.update({
        where: { id: member.id },
        data: { displayName },
      });
    } catch {
      // Reservation display names are best-effort; Clerk profile outages must
      // not prevent an otherwise authenticated member from using the app.
      return member;
    }
  }
}
