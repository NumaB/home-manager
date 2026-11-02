import { Module } from "@nestjs/common";
import {
  BookingAdminController,
  ReservationsController,
} from "./reservations.controller";
import { ReservationsService } from "./reservations.service";

@Module({
  controllers: [ReservationsController, BookingAdminController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
