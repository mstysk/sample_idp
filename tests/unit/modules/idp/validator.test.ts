import { assertEquals } from "@std/assert";
import {
  create,
  isAuthoizationQueryParams,
} from "../../../../src/Modules/Idp/Validator.ts";

// Mock environment for client validation
Deno.env.set("CLIENT_ID", "test-client-id");
Deno.env.set("CLIENT_SECRET", "test-client-secret");
Deno.env.set("REDIRECT_URI", "http://localhost:3000/callback");
Deno.env.set(
  "CLIENTS",
  JSON.stringify([{
    id: "test-client-id",
    secret: "test-client-secret",
    redirectUris: ["http://localhost:3000/callback"],
  }]),
);

Deno.test("Validator - should validate correct authorization parameters", async () => {
  const validator = create();
  const params = new URLSearchParams({
    scope: "openid profile email",
    response_type: "code",
    client_id: "test-client-id",
    redirect_uri: "http://localhost:3000/callback",
    state: "test-state",
    nonce: "test-nonce",
  });

  const result = await validator.validate(params);

  if (isAuthoizationQueryParams(result)) {
    assertEquals(result.scope.includes("openid"), true);
    assertEquals(result.scope.includes("profile"), true);
    assertEquals(result.scope.includes("email"), true);
    assertEquals(result.responseType, "code");
    assertEquals(result.clientId, "test-client-id");
    assertEquals(result.redirectUri.href, "http://localhost:3000/callback");
    assertEquals(result.state, "test-state");
    assertEquals(result.nonce, "test-nonce");
  } else {
    throw new Error("Validation should have succeeded");
  }
});

Deno.test("Validator - should reject missing scope", async () => {
  const validator = create();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: "test-client-id",
    redirect_uri: "http://localhost:3000/callback",
    state: "test-state",
  });

  const result = await validator.validate(params);

  assertEquals(isAuthoizationQueryParams(result), false);
  assertEquals((result as { message: string }).message, "scope is invalid");
});

Deno.test("Validator - should reject scope without openid", async () => {
  const validator = create();
  const params = new URLSearchParams({
    scope: "profile email",
    response_type: "code",
    client_id: "test-client-id",
    redirect_uri: "http://localhost:3000/callback",
    state: "test-state",
  });

  const result = await validator.validate(params);

  assertEquals(isAuthoizationQueryParams(result), false);
  assertEquals((result as { message: string }).message, "scope is only openid");
});

Deno.test("Validator - should reject invalid response_type", async () => {
  const validator = create();
  const params = new URLSearchParams({
    scope: "openid profile",
    response_type: "token",
    client_id: "test-client-id",
    redirect_uri: "http://localhost:3000/callback",
    state: "test-state",
  });

  const result = await validator.validate(params);

  assertEquals(isAuthoizationQueryParams(result), false);
  assertEquals(
    (result as { message: string }).message,
    "response_type is only code",
  );
});

Deno.test("Validator - should reject missing client_id", async () => {
  const validator = create();
  const params = new URLSearchParams({
    scope: "openid profile",
    response_type: "code",
    redirect_uri: "http://localhost:3000/callback",
    state: "test-state",
  });

  const result = await validator.validate(params);

  assertEquals(isAuthoizationQueryParams(result), false);
  assertEquals(
    (result as { message: string }).message,
    "client_id is not found",
  );
});

Deno.test("Validator - should reject missing state", async () => {
  const validator = create();
  const params = new URLSearchParams({
    scope: "openid profile",
    response_type: "code",
    client_id: "test-client-id",
    redirect_uri: "http://localhost:3000/callback",
  });

  const result = await validator.validate(params);

  assertEquals(isAuthoizationQueryParams(result), false);
  assertEquals((result as { message: string }).message, "state is not found");
});
