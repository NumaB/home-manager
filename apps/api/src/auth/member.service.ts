import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { createClerkClient } from "@clerk/backend";
import type { Member } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { randomReservationColor } from "./reservation-colors";

export function getInitialDisplayName(
  firstName?: string | null,
  email?: string | null,
): string {
  return firstName?.trim() || email?.trim() || "Membre";
}

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

  async updateDisplayName(
    memberId: string,
    displayNameInput: unknown,
  ): Promise<Member> {
    if (typeof displayNameInput !== "string") {
      throw new BadRequestException("displayName must be a string");
    }
    const displayName = displayNameInput.trim();
    if (!displayName || displayName.length > 80) {
      throw new BadRequestException(
        "displayName must contain between 1 and 80 characters",
      );
    }
    return this.prisma.member.update({
      where: { id: memberId },
      data: { displayName, displayNameInitialized: true },
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
    if (member.displayNameInitialized) return member;
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) return member;
    try {
      const clerk = createClerkClient({ secretKey });
      const user = await clerk.users.getUser(member.clerkUserId);
      const displayName = getInitialDisplayName(
        user.firstName,
        user.primaryEmailAddress?.emailAddress,
      );
      return await this.prisma.member.update({
        where: { id: member.id },
        data: { displayName, displayNameInitialized: true },
      });
    } catch {
      // Reservation display names are best-effort; Clerk profile outages must
      // not prevent an otherwise authenticated member from using the app.
      return member;
    }
  }
}
