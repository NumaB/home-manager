import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  ReservationStatus,
  ReservationVoteChoice,
} from "@prisma/client";
import type { Member } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { countVotes, resolveVoteOutcome } from "./reservation-rules";

const reservationInclude = {
  creator: { select: { id: true, displayName: true } },
  voters: { select: { memberId: true, choice: true } },
} satisfies Prisma.ReservationInclude;

type ReservationRecord = Prisma.ReservationGetPayload<{
  include: typeof reservationInclude;
}>;

type Tx = Prisma.TransactionClient;

export type ReservationView = {
  id: string;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  createdAt: string;
  creator: { id: string; displayName: string };
  approvals: number;
  rejections: number;
  totalEligibleVoters: number;
  currentMemberVote: ReservationVoteChoice | null;
};

export type BookingSettingsView = {
  approvalEnabled: boolean;
};

export function parseDateOnly(value: unknown, fieldName: string): Date {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException(`${fieldName} must use YYYY-MM-DD format`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new BadRequestException(`${fieldName} is not a valid calendar date`);
  }
  return date;
}

function asDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function present(record: ReservationRecord, memberId: string): ReservationView {
  const counts = countVotes(record.voters.map((voter) => voter.choice));
  return {
    id: record.id,
    startDate: asDateOnly(record.startDate),
    endDate: asDateOnly(record.endDate),
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    creator: record.creator,
    approvals: counts.approvals,
    rejections: counts.rejections,
    totalEligibleVoters: counts.eligible,
    currentMemberVote:
      record.voters.find((voter) => voter.memberId === memberId)?.choice ??
      null,
  };
}

@Injectable()
export class ReservationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listForMonth(
    month: string,
    memberId: string,
  ): Promise<ReservationView[]> {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new BadRequestException("month must use YYYY-MM format");
    }
    const firstDay = new Date(`${month}-01T00:00:00.000Z`);
    const lastDay = new Date(
      Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth() + 1, 0),
    );
    const records = await this.prisma.reservation.findMany({
      where: {
        startDate: { lte: lastDay },
        endDate: { gte: firstDay },
      },
      include: reservationInclude,
      orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
    });
    return records.map((record) => present(record, memberId));
  }

  async findOverlaps(
    startDateInput: unknown,
    endDateInput: unknown,
    excludeReservationId?: string,
  ): Promise<ReservationView[]> {
    const startDate = parseDateOnly(startDateInput, "startDate");
    const endDate = parseDateOnly(endDateInput, "endDate");
    this.assertDateRange(startDate, endDate);
    const records = await this.prisma.reservation.findMany({
      where: {
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      },
      include: reservationInclude,
      orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
    });
    return records.map((record) => present(record, ""));
  }

  async create(
    member: Member,
    startDateInput: unknown,
    endDateInput: unknown,
  ): Promise<ReservationView> {
    const startDate = parseDateOnly(startDateInput, "startDate");
    const endDate = parseDateOnly(endDateInput, "endDate");
    this.assertDateRange(startDate, endDate);

    return this.serializable(async (tx) => {
      const settings = await this.settingsIn(tx);
      const electorate = settings.approvalEnabled
        ? await tx.member.findMany({
            where: { isActive: true },
            select: { id: true },
          })
        : [];
      const status = settings.approvalEnabled
        ? ReservationStatus.PENDING
        : ReservationStatus.APPROVED;
      const record = await tx.reservation.create({
        data: {
          creatorId: member.id,
          startDate,
          endDate,
          status,
          voters: {
            create: electorate.map(({ id }) => ({ memberId: id })),
          },
        },
        include: reservationInclude,
      });
      return present(record, member.id);
    });
  }

  async updateDates(
    id: string,
    member: Member,
    startDateInput: unknown,
    endDateInput: unknown,
  ): Promise<ReservationView> {
    const startDate = parseDateOnly(startDateInput, "startDate");
    const endDate = parseDateOnly(endDateInput, "endDate");
    this.assertDateRange(startDate, endDate);

    return this.serializable(async (tx) => {
      const existing = await tx.reservation.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException("Reservation not found");
      if (existing.creatorId !== member.id) {
        throw new ForbiddenException(
          "Only the creator can edit this reservation",
        );
      }
      if (
        asDateOnly(existing.startDate) === asDateOnly(startDate) &&
        asDateOnly(existing.endDate) === asDateOnly(endDate)
      ) {
        const unchanged = await tx.reservation.findUniqueOrThrow({
          where: { id },
          include: reservationInclude,
        });
        return present(unchanged, member.id);
      }

      const settings = await this.settingsIn(tx);
      const electorate = settings.approvalEnabled
        ? await tx.member.findMany({
            where: { isActive: true },
            select: { id: true },
          })
        : [];
      await tx.reservationVoter.deleteMany({ where: { reservationId: id } });
      const record = await tx.reservation.update({
        where: { id },
        data: {
          startDate,
          endDate,
          status: settings.approvalEnabled
            ? ReservationStatus.PENDING
            : ReservationStatus.APPROVED,
          voters: {
            create: electorate.map(({ id: voterId }) => ({
              memberId: voterId,
            })),
          },
        },
        include: reservationInclude,
      });
      return present(record, member.id);
    });
  }

  async cancel(id: string, member: Member): Promise<void> {
    await this.serializable(async (tx) => {
      const existing = await tx.reservation.findUnique({
        where: { id },
        select: { creatorId: true },
      });
      if (!existing) throw new NotFoundException("Reservation not found");
      if (existing.creatorId !== member.id) {
        throw new ForbiddenException(
          "Only the creator can cancel this reservation",
        );
      }
      await tx.reservation.delete({ where: { id } });
    });
  }

  async vote(
    id: string,
    member: Member,
    choiceInput: unknown,
  ): Promise<{ deleted: boolean; reservation: ReservationView | null }> {
    if (
      choiceInput !== ReservationVoteChoice.APPROVE &&
      choiceInput !== ReservationVoteChoice.REJECT
    ) {
      throw new BadRequestException("choice must be APPROVE or REJECT");
    }
    const choice = choiceInput;

    return this.serializable(async (tx) => {
      const existing = await tx.reservation.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException("Reservation not found");
      if (existing.status !== ReservationStatus.PENDING) {
        throw new BadRequestException(
          "This reservation is no longer awaiting votes",
        );
      }
      const voter = await tx.reservationVoter.findUnique({
        where: {
          reservationId_memberId: { reservationId: id, memberId: member.id },
        },
      });
      if (!voter) {
        throw new ForbiddenException(
          "You are not eligible to vote on this reservation",
        );
      }
      await tx.reservationVoter.update({
        where: {
          reservationId_memberId: { reservationId: id, memberId: member.id },
        },
        data: { choice },
      });
      const outcome = await this.resolvePendingIn(tx, id);
      if (outcome === "REJECTED") return { deleted: true, reservation: null };
      const record = await tx.reservation.findUnique({
        where: { id },
        include: reservationInclude,
      });
      return {
        deleted: false,
        reservation: record ? present(record, member.id) : null,
      };
    });
  }

  async getBookingSettings(): Promise<BookingSettingsView> {
    const settings = await this.prisma.bookingSettings.upsert({
      where: { id: "global" },
      create: { id: "global", approvalEnabled: false },
      update: {},
    });
    return { approvalEnabled: settings.approvalEnabled };
  }

  async updateBookingSettings(
    approvalEnabledInput: unknown,
  ): Promise<BookingSettingsView> {
    if (typeof approvalEnabledInput !== "boolean") {
      throw new BadRequestException("approvalEnabled must be a boolean");
    }
    return this.serializable(async (tx) => {
      const existing = await this.settingsIn(tx);
      if (existing.approvalEnabled !== approvalEnabledInput) {
        await tx.bookingSettings.update({
          where: { id: "global" },
          data: { approvalEnabled: approvalEnabledInput },
        });
        await tx.reservation.updateMany({
          where: { status: ReservationStatus.PENDING },
          data: { status: ReservationStatus.APPROVED },
        });
      }
      return { approvalEnabled: approvalEnabledInput };
    });
  }

  async setMemberActive(
    memberId: string,
    isActiveInput: unknown,
  ): Promise<{ id: string; isActive: boolean }> {
    if (typeof isActiveInput !== "boolean") {
      throw new BadRequestException("isActive must be a boolean");
    }
    return this.serializable(async (tx) => {
      const existing = await tx.member.findUnique({
        where: { id: memberId },
        select: { id: true, isActive: true },
      });
      if (!existing) throw new NotFoundException("Member not found");
      if (existing.isActive === isActiveInput) return existing;

      await tx.member.update({
        where: { id: memberId },
        data: { isActive: isActiveInput },
      });
      if (!isActiveInput) {
        const memberships = await tx.reservationVoter.findMany({
          where: {
            memberId,
            reservation: { status: ReservationStatus.PENDING },
          },
          select: { reservationId: true },
        });
        const affectedIds = [
          ...new Set(memberships.map(({ reservationId }) => reservationId)),
        ];
        await tx.reservationVoter.deleteMany({
          where: { memberId, reservationId: { in: affectedIds } },
        });
        for (const reservationId of affectedIds) {
          await this.resolvePendingIn(tx, reservationId);
        }
      }
      return { id: memberId, isActive: isActiveInput };
    });
  }

  private assertDateRange(startDate: Date, endDate: Date) {
    if (startDate > endDate) {
      throw new BadRequestException("endDate must be on or after startDate");
    }
  }

  private settingsIn(tx: Tx) {
    return tx.bookingSettings.upsert({
      where: { id: "global" },
      create: { id: "global", approvalEnabled: false },
      update: {},
    });
  }

  private async resolvePendingIn(
    tx: Tx,
    reservationId: string,
  ): Promise<ReservationStatus | "REJECTED" | null> {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      select: { status: true },
    });
    if (!reservation || reservation.status !== ReservationStatus.PENDING)
      return null;
    const voters = await tx.reservationVoter.findMany({
      where: { reservationId },
      select: { choice: true },
    });
    const outcome = resolveVoteOutcome(
      countVotes(voters.map(({ choice }) => choice)),
    );
    if (outcome === ReservationStatus.APPROVED) {
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.APPROVED },
      });
    } else if (outcome === "REJECTED") {
      await tx.reservation.delete({ where: { id: reservationId } });
    }
    return outcome;
  }

  private async serializable<T>(operation: (tx: Tx) => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.prisma.$transaction(operation, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        const retryable =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034";
        if (!retryable || attempt >= 2) throw error;
      }
    }
  }
}
