import { Controller, Get } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { Member } from "@prisma/client";
import { CurrentMember } from "./auth.decorators";

type CurrentMemberResponse = Pick<Member, "id" | "role" | "isActive">;

@ApiTags("auth")
@ApiBearerAuth("clerk-session")
@Controller("auth")
export class AuthController {
  @Get("me")
  @ApiOperation({ summary: "Retourne le membre applicatif connecté" })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        role: { type: "string", enum: ["USER", "ADMIN"] },
        isActive: { type: "boolean" },
      },
      required: ["id", "role", "isActive"],
    },
  })
  getCurrentMember(@CurrentMember() member: Member): CurrentMemberResponse {
    return {
      id: member.id,
      role: member.role,
      isActive: member.isActive,
    };
  }
}
