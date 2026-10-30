import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import {
  BookingAdminController,
  ReservationsController,
} from "./reservations.controller";
import { ReservationsService } from "./reservations.service";

test("explicitly registers the service dependency for the runtime DI container", () => {
  for (const controller of [ReservationsController, BookingAdminController]) {
    const dependencies = Reflect.getMetadata(
      "self:paramtypes",
      controller,
    ) as Array<{ index: number; param: unknown }>;
    assert.equal(dependencies?.[0]?.param, ReservationsService);
  }
});
