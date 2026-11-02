import { Module } from "@nestjs/common";
import { AuthModule } from "@/auth/auth.module";
import { HealthModule } from "@/health/health.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { ReservationsModule } from "@/reservations/reservations.module";

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, ReservationsModule],
})
export class AppModule {}
