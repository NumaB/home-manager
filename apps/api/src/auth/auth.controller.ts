import { Controller, Get, Inject } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { Member } from "@prisma/client";
import { CurrentMemberResponseDto } from "@/openapi/dtos/members.dto";
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
    };
  }
}
