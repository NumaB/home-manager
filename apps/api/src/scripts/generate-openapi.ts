import "reflect-metadata";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AuthController } from "@/auth/auth.controller";
import { MemberService } from "@/auth/member.service";
import { HealthController } from "@/health/health.controller";
import {
  BookingAdminController,
  ReservationsController,
} from "@/reservations/reservations.controller";
import { ReservationsService } from "@/reservations/reservations.service";

@Module({
  controllers: [
    AuthController,
    HealthController,
    ReservationsController,
    BookingAdminController,
  ],
  providers: [
    { provide: MemberService, useValue: {} },
    { provide: ReservationsService, useValue: {} },
  ],
})
class OpenApiModule {}

async function generateOpenApi() {
  const app = await NestFactory.create(OpenApiModule, { logger: false });
  try {
    app.setGlobalPrefix("api");
    await app.init();

    const config = new DocumentBuilder()
      .setTitle("Doz Manager API")
      .setDescription("API REST de Doz Manager")
      .setVersion("0.0.0")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "clerk-session",
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const outputPath = resolve(process.cwd(), "openapi.json");
    writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`);
    console.log(`OpenAPI document written to ${outputPath}`);
  } finally {
    await app.close();
  }
}

void generateOpenApi();
