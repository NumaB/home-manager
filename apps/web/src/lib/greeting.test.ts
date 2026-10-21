import assert from "node:assert/strict";
import test from "node:test";
import { getWelcomeMessage } from "./greeting";

test("web displays a local scaffold welcome message", () => {
  assert.equal(getWelcomeMessage(), "Le socle local est prêt.");
});
