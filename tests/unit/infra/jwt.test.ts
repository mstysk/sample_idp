import { assertEquals } from "@std/assert";
import { createJWT, verifyJWT } from "../../../src/Infra/JWT.ts";

// Set up test environment - need at least 32 bytes for HMAC-SHA256
Deno.env.set(
  "JWT_SECRET",
  "test-secret-key-for-testing-with-sufficient-length-32-bytes",
);

Deno.test("JWT - createJWT should create a valid JWT token", async () => {
  const payload = {
    sub: "test-user-id",
    email: "test@example.com",
    name: "Test User",
  };

  const token = await createJWT(payload);

  // JWT should be a string with 3 parts separated by dots
  assertEquals(typeof token, "string");
  assertEquals(token.split(".").length, 3);
});

Deno.test("JWT - verifyJWT should verify a valid token", async () => {
  const payload = {
    sub: "test-user-id",
    email: "test@example.com",
    name: "Test User",
  };

  const token = await createJWT(payload);
  const verified = await verifyJWT(token);

  assertEquals(verified?.sub, payload.sub);
  assertEquals(verified?.email, payload.email);
  assertEquals(verified?.name, payload.name);
});

Deno.test("JWT - verifyJWT should return null for invalid token", async () => {
  const invalidToken = "invalid.token.here";
  const result = await verifyJWT(invalidToken);

  assertEquals(result, null);
});

Deno.test("JWT - verifyJWT should return null for malformed token", async () => {
  const malformedToken = "not-a-jwt-token";
  const result = await verifyJWT(malformedToken);

  assertEquals(result, null);
});

Deno.test("JWT - created token should have expiration", async () => {
  const payload = { sub: "test-user" };
  const token = await createJWT(payload);
  const verified = await verifyJWT(token);

  // Token should have an expiration time
  assertEquals(typeof verified?.exp, "number");
  assertEquals(typeof verified?.iat, "number");

  // Expiration should be in the future
  const now = Math.floor(Date.now() / 1000);
  if (verified?.exp) {
    assertEquals(verified.exp > now, true);
  }
});
