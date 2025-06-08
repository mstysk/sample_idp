import { assertEquals, assertNotEquals } from "@std/assert";
import { encode, decode } from "../../../../src/Modules/Authenticate/Authenticate.ts";
import { UserType } from "../../../../src/Repository/User.ts";

// Set up test environment - need at least 32 bytes for HMAC-SHA256
Deno.env.set("JWT_SECRET", "test-secret-key-for-authentication-with-sufficient-length-32");

const testUser: UserType = {
  id: "test-user-id",
  email: "test@example.com",
  displayName: "Test User",
  avatarUrl: "https://example.com/avatar.jpg",
  userId: "test-user-id",
  createdAt: new Date(),
};

Deno.test("Authenticate - encode should create access token", async () => {
  const token = await encode(testUser);
  
  assertEquals(typeof token, "string");
  assertNotEquals(token.length, 0);
  assertEquals(token.split(".").length, 3); // JWT format
});

Deno.test("Authenticate - decode should return user from valid token", async () => {
  const token = await encode(testUser);
  const decodedUser = await decode(token);
  
  assertEquals(decodedUser?.id, testUser.id);
  assertEquals(decodedUser?.email, testUser.email);
  assertEquals(decodedUser?.displayName, testUser.displayName);
  assertEquals(decodedUser?.avatarUrl, testUser.avatarUrl);
});

Deno.test("Authenticate - decode should return null for invalid token", async () => {
  const invalidToken = "invalid.token.here";
  const result = await decode(invalidToken);
  
  assertEquals(result, null);
});

Deno.test("Authenticate - decode should return null for empty token", async () => {
  const result = await decode("");
  
  assertEquals(result, null);
});

Deno.test("Authenticate - decode should return null for malformed token", async () => {
  const malformedToken = "not-a-jwt-token";
  const result = await decode(malformedToken);
  
  assertEquals(result, null);
});

Deno.test("Authenticate - round trip encoding and decoding", async () => {
  const originalUser = testUser;
  
  // Encode user to token
  const token = await encode(originalUser);
  
  // Decode token back to user
  const decodedUser = await decode(token);
  
  // Should match original user
  assertEquals(decodedUser?.id, originalUser.id);
  assertEquals(decodedUser?.email, originalUser.email);
  assertEquals(decodedUser?.displayName, originalUser.displayName);
  assertEquals(decodedUser?.avatarUrl, originalUser.avatarUrl);
});