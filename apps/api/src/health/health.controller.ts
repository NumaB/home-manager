import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/auth.decorators";

@ApiTags("health")
@Public()
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Vérifie que l’API est démarrée" })
  @ApiOkResponse({ schema: { example: { status: "ok" } } })
  getHealth() {
    return { status: "ok" };
  }
}
