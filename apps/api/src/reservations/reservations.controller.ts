import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { MemberRole } from "@prisma/client";
import type { Member } from "@prisma/client";
import { CurrentMember, RequireRoles } from "@/auth/auth.decorators";
import { ReservationsService } from "./reservations.service";
import {
  ReservationDatesDto,
  ReservationResponseDto,
  ReservationVoteDto,
} from "@/openapi/dtos/reservations.dto";

@ApiTags("reservations")
@ApiBearerAuth("clerk-session")
@Controller("reservations")
export class ReservationsController {
  constructor(
    @Inject(ReservationsService)
    private readonly reservations: ReservationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Liste les réservations qui chevauchent un mois" })
  @ApiOkResponse({
    description: "Réservations du mois et compteurs de vote",
    type: ReservationResponseDto,
    isArray: true,
  })
  listForMonth(@Query("month") month: string, @CurrentMember() member: Member) {
    return this.reservations.listForMonth(month, member.id);
  }

  @Get("overlaps")
  @ApiOperation({
    summary: "Recherche les réservations chevauchant une période",
  })
  @ApiOkResponse({ type: ReservationResponseDto, isArray: true })
  findOverlaps(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("excludeReservationId") excludeReservationId?: string,
  ) {
    return this.reservations.findOverlaps(
      startDate,
      endDate,
      excludeReservationId,
    );
  }

  @Post()
  @ApiOperation({ summary: "Crée une réservation pour le membre connecté" })
  @ApiBody({ type: ReservationDatesDto })
  @ApiOkResponse({ type: ReservationResponseDto })
  create(
    @Body() body: { startDate?: unknown; endDate?: unknown },
    @CurrentMember() member: Member,
  ) {
    return this.reservations.create(member, body.startDate, body.endDate);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Modifie les dates d'une réservation du membre" })
  @ApiBody({ type: ReservationDatesDto })
  @ApiOkResponse({ type: ReservationResponseDto })
  updateDates(
    @Param("id") id: string,
    @Body() body: { startDate?: unknown; endDate?: unknown },
    @CurrentMember() member: Member,
  ) {
    return this.reservations.updateDates(
      id,
      member,
      body.startDate,
      body.endDate,
    );
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiNoContentResponse({ description: "Réservation annulée" })
  @ApiOperation({ summary: "Annule une réservation du membre connecté" })
  cancel(@Param("id") id: string, @CurrentMember() member: Member) {
    return this.reservations.cancel(id, member);
  }

  @Put(":id/vote")
  @ApiOperation({ summary: "Vote ou modifie le vote d'une demande en attente" })
  @ApiBody({ type: ReservationVoteDto })
  @ApiOkResponse({ type: ReservationResponseDto })
  vote(
    @Param("id") id: string,
    @Body() body: { choice?: unknown },
    @CurrentMember() member: Member,
  ) {
    return this.reservations.vote(id, member, body.choice);
  }
}

@ApiTags("admin")
@ApiBearerAuth("clerk-session")
@Controller("admin")
export class BookingAdminController {
  constructor(
    @Inject(ReservationsService)
    private readonly reservations: ReservationsService,
  ) {}

  @Get("booking-settings")
  @RequireRoles(MemberRole.ADMIN)
  @ApiOperation({ summary: "Consulte le réglage d'approbation (ADMIN)" })
  getBookingSettings() {
    return this.reservations.getBookingSettings();
  }

  @Put("booking-settings")
  @RequireRoles(MemberRole.ADMIN)
  @ApiOperation({ summary: "Modifie le réglage d'approbation (ADMIN)" })
  updateBookingSettings(@Body() body: { approvalEnabled?: unknown }) {
    return this.reservations.updateBookingSettings(body.approvalEnabled);
  }

  @Patch("members/:id/active")
  @RequireRoles(MemberRole.ADMIN)
  @ApiOperation({ summary: "Active ou désactive un membre (ADMIN)" })
  setMemberActive(
    @Param("id") memberId: string,
    @Body() body: { isActive?: unknown },
  ) {
    return this.reservations.setMemberActive(memberId, body.isActive);
  }
}
