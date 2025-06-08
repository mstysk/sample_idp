import { assertEquals } from "@std/assert";
import {
  generateIdTokenPayload,
  pickupClaims,
} from "../../../../src/Modules/Idp/IdToken.ts";
import {
  EmailScope,
  PictureScope,
  ProfileScope,
  Scope,
} from "../../../../src/Modules/Idp/Validator.ts";
import { UserType } from "../../../../src/Repository/User.ts";

const testUser: UserType = {
  id: "test-user-id",
  email: "test@example.com",
  displayName: "Test User",
  avatarUrl: "https://example.com/avatar.jpg",
  userId: "test-user-id",
  createdAt: new Date(),
};

const testParams = {
  scope: [ProfileScope, EmailScope, PictureScope] as Scope[],
  responseType: "code" as const,
  clientId: "test-client-id",
  redirectUri: new URL("http://localhost:3000/callback"),
  state: "test-state",
  nonce: "test-nonce",
};

Deno.test("IdToken - generateIdTokenPayload should create valid payload", () => {
  const issuer = "https://test-issuer.com";
  const payload = generateIdTokenPayload(testUser, testParams, issuer);

  assertEquals(payload.iss, issuer);
  assertEquals(payload.sub, testUser.id);
  assertEquals(payload.aud, testParams.clientId);
  assertEquals(payload.nonce, testParams.nonce);
  assertEquals(typeof payload.exp, "number");
  assertEquals(typeof payload.iat, "number");

  // Should include claims from scopes
  assertEquals(payload.name, testUser.displayName);
  assertEquals(payload.email, testUser.email);
  assertEquals(payload.picture, testUser.avatarUrl);
});

Deno.test("IdToken - generateIdTokenPayload should use default issuer", () => {
  Deno.env.set("ISSUER", "https://default-issuer.com");
  const payload = generateIdTokenPayload(testUser, testParams);

  assertEquals(payload.iss, "https://default-issuer.com");
});

Deno.test("IdToken - generateIdTokenPayload should fallback to localhost", () => {
  Deno.env.delete("ISSUER");
  const payload = generateIdTokenPayload(testUser, testParams);

  assertEquals(payload.iss, "https://localhost");
});

Deno.test("IdToken - pickupClaims should include profile scope claims", () => {
  const claims = pickupClaims(testUser, [ProfileScope]);

  assertEquals(claims.name, testUser.displayName);
  assertEquals(claims.email, undefined);
  assertEquals(claims.picture, undefined);
});

Deno.test("IdToken - pickupClaims should include email scope claims", () => {
  const claims = pickupClaims(testUser, [EmailScope]);

  assertEquals(claims.email, testUser.email);
  assertEquals(claims.name, undefined);
  assertEquals(claims.picture, undefined);
});

Deno.test("IdToken - pickupClaims should include picture scope claims", () => {
  const claims = pickupClaims(testUser, [PictureScope]);

  assertEquals(claims.picture, testUser.avatarUrl);
  assertEquals(claims.name, undefined);
  assertEquals(claims.email, undefined);
});

Deno.test("IdToken - pickupClaims should include multiple scope claims", () => {
  const claims = pickupClaims(testUser, [
    ProfileScope,
    EmailScope,
    PictureScope,
  ]);

  assertEquals(claims.name, testUser.displayName);
  assertEquals(claims.email, testUser.email);
  assertEquals(claims.picture, testUser.avatarUrl);
});

Deno.test("IdToken - pickupClaims should return empty object for no matching scopes", () => {
  const claims = pickupClaims(testUser, []);

  assertEquals(Object.keys(claims).length, 0);
});
