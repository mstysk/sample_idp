import { assertEquals, assertThrows } from "@std/assert";
import { createJWT, verifyJWT } from "../../../src/Infra/JWT.ts";

// Set up test environment
Deno.env.set(
  "JWT_SECRET",
  "test-secret-key-for-testing-with-sufficient-length-32-bytes",
);

Deno.test("JWT - should handle missing JWT_SECRET environment variable", async () => {
  // Temporarily remove JWT_SECRET
  const originalSecret = Deno.env.get("JWT_SECRET");
  Deno.env.delete("JWT_SECRET");

  await assertThrows(
    async () => {
      await createJWT({ sub: "test" });
    },
    Error,
    "JWT_SECRET environment variable is required",
  );

  // Restore original value
  if (originalSecret) {
    Deno.env.set("JWT_SECRET", originalSecret);
  }
});

Deno.test("JWT - should create JWT with various payload types", async () => {
  const payloads = [
    { sub: "user123", email: "test@example.com" },
    { sub: "user456", role: "admin", permissions: ["read", "write"] },
    { sub: "user789", metadata: { plan: "premium", created: "2024-01-01" } },
    { sub: "user000", exp: Math.floor(Date.now() / 1000) + 3600 }, // Custom expiration
  ];

  for (const payload of payloads) {
    const token = await createJWT(payload);
    assertEquals(typeof token, "string");
    assertEquals(token.split(".").length, 3);

    const verified = await verifyJWT(token);
    assertEquals(verified?.sub, payload.sub);
  }
});

Deno.test("JWT - should handle empty payload", async () => {
  const token = await createJWT({});
  assertEquals(typeof token, "string");

  const verified = await verifyJWT(token);
  assertEquals(typeof verified?.iat, "number");
  assertEquals(typeof verified?.exp, "number");
});

Deno.test("JWT - should handle payload with null values", async () => {
  const payload = {
    sub: "test-user",
    email: null,
    name: undefined,
    role: "user",
  };

  const token = await createJWT(payload);
  const verified = await verifyJWT(token);

  assertEquals(verified?.sub, "test-user");
  assertEquals(verified?.email, null);
  assertEquals(verified?.role, "user");
});

Deno.test("JWT - should verify JWT with specific claims", async () => {
  const payload = {
    sub: "specific-user",
    aud: "test-audience",
    iss: "test-issuer",
    custom_claim: "custom_value",
  };

  const token = await createJWT(payload);
  const verified = await verifyJWT(token);

  assertEquals(verified?.sub, payload.sub);
  assertEquals(verified?.aud, payload.aud);
  assertEquals(verified?.iss, payload.iss);
  assertEquals(verified?.custom_claim, payload.custom_claim);
});

Deno.test("JWT - should handle very long payload", async () => {
  const longString = "a".repeat(1000);
  const payload = {
    sub: "long-payload-user",
    long_field: longString,
    array_field: new Array(100).fill("item"),
    nested: {
      deep: {
        value: longString,
      },
    },
  };

  const token = await createJWT(payload);
  const verified = await verifyJWT(token);

  assertEquals(verified?.sub, "long-payload-user");
  assertEquals(verified?.long_field, longString);
  assertEquals(Array.isArray(verified?.array_field), true);
  assertEquals((verified?.array_field as unknown[])?.length, 100);
});

Deno.test("JWT - should handle tokens with expired timestamps", async () => {
  // Create a token that's already expired
  const expiredPayload = {
    sub: "expired-user",
    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
  };

  const token = await createJWT(expiredPayload);

  // Token should still be created
  assertEquals(typeof token, "string");

  // But verification should return null for expired token
  const verified = await verifyJWT(token);
  assertEquals(verified, null);
});

Deno.test("JWT - should handle malformed JWT structures", async () => {
  const malformedTokens = [
    "invalid",
    "invalid.token",
    "invalid.token.signature.extra",
    "..",
    "header..signature",
    "header.payload.",
    ".payload.signature",
  ];

  for (const malformedToken of malformedTokens) {
    const result = await verifyJWT(malformedToken);
    assertEquals(result, null);
  }
});

Deno.test("JWT - should handle tokens with invalid base64", async () => {
  const invalidBase64Tokens = [
    "invalid!!!.payload.signature",
    "header.invalid!!!.signature",
    "header.payload.invalid!!!",
  ];

  for (const invalidToken of invalidBase64Tokens) {
    const result = await verifyJWT(invalidToken);
    assertEquals(result, null);
  }
});

Deno.test("JWT - should handle tokens with valid structure but invalid signature", async () => {
  // Create a valid token first
  const validToken = await createJWT({ sub: "test" });
  const parts = validToken.split(".");

  // Modify the signature to make it invalid
  const invalidToken = parts[0] + "." + parts[1] + ".invalid_signature";

  const result = await verifyJWT(invalidToken);
  assertEquals(result, null);
});

Deno.test("JWT - should handle tokens with tampered payload", async () => {
  // Create a valid token first
  const validToken = await createJWT({ sub: "original" });
  const parts = validToken.split(".");

  // Create a new payload and encode it
  const tamperedPayload = btoa(JSON.stringify({ sub: "tampered" }));
  const tamperedToken = parts[0] + "." + tamperedPayload + "." + parts[2];

  const result = await verifyJWT(tamperedToken);
  assertEquals(result, null);
});

Deno.test("JWT - should create tokens with consistent algorithm", async () => {
  const token = await createJWT({ sub: "alg-test" });
  const parts = token.split(".");

  // Decode header to check algorithm
  const header = JSON.parse(atob(parts[0]));
  assertEquals(header.alg, "HS256");
  assertEquals(header.typ, "JWT");
});

Deno.test("JWT - should handle numeric and boolean values in payload", async () => {
  const payload = {
    sub: "numeric-test",
    age: 25,
    score: 98.5,
    is_admin: true,
    is_active: false,
    count: 0,
  };

  const token = await createJWT(payload);
  const verified = await verifyJWT(token);

  assertEquals(verified?.sub, "numeric-test");
  assertEquals(verified?.age, 25);
  assertEquals(verified?.score, 98.5);
  assertEquals(verified?.is_admin, true);
  assertEquals(verified?.is_active, false);
  assertEquals(verified?.count, 0);
});

Deno.test("JWT - should set automatic iat and exp claims", async () => {
  const beforeCreate = Math.floor(Date.now() / 1000);

  const token = await createJWT({ sub: "time-test" });
  const verified = await verifyJWT(token);

  const afterCreate = Math.floor(Date.now() / 1000);

  // iat should be around current time
  assertEquals(typeof verified?.iat, "number");
  if (verified?.iat) {
    assertEquals(verified.iat >= beforeCreate, true);
    assertEquals(verified.iat <= afterCreate, true);
  }

  // exp should be 1 hour after iat
  assertEquals(typeof verified?.exp, "number");
  if (verified?.exp && verified?.iat) {
    assertEquals(verified.exp, verified.iat + 3600);
  }
});
