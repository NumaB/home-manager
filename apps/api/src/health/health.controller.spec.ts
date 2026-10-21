import assert from "node:assert/strict";
import test from "node:test";
import { HealthController } from "./health.controller";

test("health endpoint returns a minimal healthy status", () => {
  const result = new HealthController().getHealth();
  assert.deepEqual(result, { status: "ok" });
});
