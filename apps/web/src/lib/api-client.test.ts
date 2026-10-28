import assert from "node:assert/strict";
import test from "node:test";
import { ApiRequestError, apiRequest } from "./api-client";

test("sends the Clerk session token to the REST API as a bearer token", async () => {
  const originalFetch = globalThis.fetch;
  let authorization: string | null = null;
  let requestedUrl = "";

  globalThis.fetch = (async (input, init) => {
    requestedUrl = String(input);
    authorization = new Headers(init?.headers).get("Authorization");
    return Response.json({ id: "member_1" });
  }) as typeof fetch;

  try {
    const response = await apiRequest<{ id: string }>(
      "/auth/me",
      async () => "clerk-session-token",
    );
    assert.equal(requestedUrl, "http://localhost:3001/api/auth/me");
    assert.equal(authorization, "Bearer clerk-session-token");
    assert.deepEqual(response, { id: "member_1" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("does not call the API when Clerk has no session token", async () => {
  const originalFetch = globalThis.fetch;
  let requested = false;
  globalThis.fetch = (async () => {
    requested = true;
    return Response.json({});
  }) as typeof fetch;

  try {
    await assert.rejects(
      apiRequest("auth/me", async () => null),
      (error: unknown) =>
        error instanceof ApiRequestError && error.status === 401,
    );
    assert.equal(requested, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
