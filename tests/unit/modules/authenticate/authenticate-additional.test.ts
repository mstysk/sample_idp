import { assertEquals } from "@std/assert";
import {
  createAuthenticateRepository,
  decode,
  encode,
} from "../../../../src/Modules/Authenticate/Authenticate.ts";
import { createUserRepository } from "../../../../src/Repository/User.ts";

// Set up test environment
Deno.env.set(
  "JWT_SECRET",
  "test-secret-key-for-testing-with-sufficient-length-32-bytes",
);

Deno.test("AuthenticateRepository - should create repository with default user repository", async () => {
  const authRepo = await createAuthenticateRepository();

  assertEquals(typeof authRepo, "object");
  assertEquals(typeof authRepo.signin, "function");
  assertEquals(typeof authRepo.isAuthenticated, "function");
});

Deno.test("AuthenticateRepository - should create repository with custom user repository", async () => {
  const userRepo = await createUserRepository();
  const authRepo = await createAuthenticateRepository(userRepo as any);

  assertEquals(typeof authRepo, "object");
  assertEquals(typeof authRepo.signin, "function");
  assertEquals(typeof authRepo.isAuthenticated, "function");
});

Deno.test("AuthenticateRepository - should signin with valid credentials", async () => {
  const userRepo = await createUserRepository();
  const authRepo = await createAuthenticateRepository(userRepo as any);

  // Create a test user
  const email = "signin@example.com";
  const password = "signin-password";
  const token = await userRepo.preregister(email);
  await userRepo.register(token, password, { name: "Signin User" } as any);

  // Test signin
  const accessToken = await authRepo.signin(email, password);

  assertEquals(typeof accessToken, "string");
  if (accessToken) {
    assertEquals(accessToken.length > 0, true);
  }
});

Deno.test("AuthenticateRepository - should return null for invalid email", async () => {
  const userRepo = await createUserRepository();
  const authRepo = await createAuthenticateRepository(userRepo);

  const accessToken = await authRepo.signin(
    "nonexistent@example.com",
    "password",
  );
  assertEquals(accessToken, null);
});

Deno.test("AuthenticateRepository - should return null for invalid password", async () => {
  const userRepo = await createUserRepository();
  const authRepo = await createAuthenticateRepository(userRepo as any);

  // Create a test user
  const email = "invalidpass@example.com";
  const password = "correct-password";
  const token = await userRepo.preregister(email);
  await userRepo.register(
    token,
    password,
    { name: "Invalid Pass User" } as any,
  );

  // Test signin with wrong password
  const accessToken = await authRepo.signin(email, "wrong-password");
  assertEquals(accessToken, null);
});

Deno.test("AuthenticateRepository - should authenticate valid token", async () => {
  const userRepo = await createUserRepository();
  const authRepo = await createAuthenticateRepository();

  // Create a test user
  const email = "auth@example.com";
  const password = "auth-password";
  const token = await userRepo.preregister(email);
  await userRepo.register(token, password, { name: "Auth User" } as any);

  // Get access token
  const accessToken = await authRepo.signin(email, password);
  if (!accessToken) throw new Error("Failed to get access token");

  // Test authentication
  const isAuthenticated = await authRepo.isAuthenticated(accessToken);
  assertEquals(isAuthenticated, true);
});

Deno.test("AuthenticateRepository - should not authenticate invalid token", async () => {
  const authRepo = await createAuthenticateRepository();

  const isAuthenticated = await authRepo.isAuthenticated("invalid-token");
  assertEquals(isAuthenticated, false);
});

Deno.test("Authenticate - encode should create valid JWT", async () => {
  const user = {
    id: "test-user-id",
    userId: "test-user-id",
    email: "encode@example.com",
    displayName: "Encode User",
    avatarUrl: "https://example.com/picture.jpg",
    createdAt: new Date(),
  };

  const token = await encode(user);

  assertEquals(typeof token, "string");
  assertEquals(token.split(".").length, 3); // JWT format
});

Deno.test("Authenticate - decode should return user from valid token", async () => {
  const user = {
    id: "test-decode-id",
    userId: "test-decode-id",
    email: "decode@example.com",
    displayName: "Decode User",
    avatarUrl: "https://example.com/decode.jpg",
    createdAt: new Date(),
  };

  const token = await encode(user);
  const decoded = await decode(token);

  assertEquals(decoded?.sub, user.id);
  assertEquals(decoded?.email, user.email);
  assertEquals(decoded?.name, user.displayName);
});

Deno.test("Authenticate - decode should return null for invalid token", async () => {
  const decoded = await decode("invalid.token.here");
  assertEquals(decoded, null);
});

Deno.test("Authenticate - decode should return null for malformed token", async () => {
  const decoded = await decode("not-a-jwt");
  assertEquals(decoded, null);
});

Deno.test("Authenticate - decode should return null for empty token", async () => {
  const decoded = await decode("");
  assertEquals(decoded, null);
});

Deno.test("Authenticate - should handle user without optional fields", async () => {
  const user = {
    id: "minimal-user-id",
    userId: "minimal-user-id",
    email: "minimal@example.com",
    displayName: "Minimal User",
    avatarUrl: "",
    createdAt: new Date(),
  };

  const token = await encode(user);
  const decoded = await decode(token);

  assertEquals(decoded?.sub, user.id);
  assertEquals(decoded?.email, user.email);
  assertEquals(decoded?.name, user.displayName);
});

Deno.test("Authenticate - should handle round trip encoding/decoding", async () => {
  const originalUser = {
    id: "roundtrip-id",
    userId: "roundtrip-id",
    email: "roundtrip@example.com",
    displayName: "Round Trip User",
    avatarUrl: "https://example.com/roundtrip.jpg",
    createdAt: new Date(),
  };

  // Encode then decode
  const token = await encode(originalUser);
  const decoded = await decode(token);

  // Verify all fields match
  assertEquals(decoded?.sub, originalUser.id);
  assertEquals(decoded?.email, originalUser.email);
  assertEquals(decoded?.name, originalUser.displayName);

  // JWT should have standard claims
  assertEquals(typeof decoded?.iat, "number");
  assertEquals(typeof decoded?.exp, "number");
  if (decoded?.exp && decoded?.iat) {
    assertEquals((decoded.exp as number) > (decoded.iat as number), true);
  }
});
