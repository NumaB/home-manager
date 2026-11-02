import { Body, Controller, Get, Inject, Put } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { Member } from "@prisma/client";
import {
  CurrentMemberResponseDto,
  UpdateDisplayNameDto,
  UpdateReservationColorDto,
} from "@/openapi/dtos/members.dto";
import { CurrentMember } from "./auth.decorators";
import { MemberService } from "./member.service";

@ApiTags("auth")
@ApiBearerAuth("clerk-session")
@Controller("auth")
export class AuthController {
  constructor(@Inject(MemberService) private readonly members: MemberService) {}

  @Get("me")
  @ApiOperation({ summary: "Retourne le membre applicatif connecté" })
  @ApiOkResponse({ type: CurrentMemberResponseDto })
  async getCurrentMember(
    @CurrentMember() currentMember: Member,
  ): Promise<CurrentMemberResponseDto> {
    const member = await this.members.syncDisplayName(currentMember);
    return {
      id: member.id,
      role: member.role,
      isActive: member.isActive,
      displayName: member.displayName,
      reservationColor: member.reservationColor,
    };
  }

  @Put("me/display-name")
  @ApiOperation({ summary: "Modifie le nom d’affichage du membre connecté" })
  @ApiBody({ type: UpdateDisplayNameDto })
  @ApiOkResponse({ type: CurrentMemberResponseDto })
  async updateDisplayName(
    @Body() body: UpdateDisplayNameDto,
    @CurrentMember() currentMember: Member,
  ): Promise<CurrentMemberResponseDto> {
    const member = await this.members.updateDisplayName(
      currentMember.id,
      body.displayName,
    );
    return {
      id: member.id,
      role: member.role,
      isActive: member.isActive,
      displayName: member.displayName,
      reservationColor: member.reservationColor,
    };
  }

  @Put("me/reservation-color")
  @ApiOperation({ summary: "Modifie la couleur des réservations du membre" })
  @ApiBody({ type: UpdateReservationColorDto })
  @ApiOkResponse({ type: CurrentMemberResponseDto })
  async updateReservationColor(
    @Body() body: UpdateReservationColorDto,
    @CurrentMember() currentMember: Member,
  ): Promise<CurrentMemberResponseDto> {
    const member = await this.members.updateReservationColor(
      currentMember.id,
      body.reservationColor,
    );
    return {
      id: member.id,
      role: member.role,
      isActive: member.isActive,
      displayName: member.displayName,
      reservationColor: member.reservationColor,
    };
  }
}
