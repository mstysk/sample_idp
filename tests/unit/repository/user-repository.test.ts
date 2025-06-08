import { assertEquals, assertThrows } from "@std/assert";
import { 
  createUserRepository, 
  generatePassowrdHash 
} from "../../../src/Repository/User.ts";
import { KVStorage } from "../../../src/Infra/KV.ts";

// Mock test interfaces to match the User repository types
interface TestUser {
  id: string;
  email: string;
  createdAt: Date;
}

interface TestUserProfile {
  id: string;
  userId: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  createdAt: Date;
}

interface TestUserSignupToken {
  id: string;
  email: string;
  expiredAt: Date;
  createdAt: Date;
}

interface TestUserActive {
  id: string;
  userId: string;
  status: string;
  createdAt: Date;
}

interface TestUserCredential {
  id: string;
  userId: string;
  passwordHash: string;
  createdAt: Date;
}

interface TestUserEvent {
  id: string;
  resourceId: string;
  type: string;
  eventData: unknown;
  createdAt: Date;
}

Deno.test("UserRepository - should create repository instance", async () => {
  const repository = await createUserRepository();
  
  assertEquals(typeof repository, "object");
  assertEquals(typeof repository.preregister, "function");
  assertEquals(typeof repository.register, "function");
  assertEquals(typeof repository.findById, "function");
  assertEquals(typeof repository.findByEmail, "function");
  assertEquals(typeof repository.verifyPassword, "function");
  assertEquals(typeof repository.verifyToken, "function");
});

Deno.test("UserRepository - should preregister user", async () => {
  const repository = await createUserRepository();
  
  const email = "test@example.com";
  const token = await repository.preregister(email);
  
  assertEquals(typeof token, "string");
  assertEquals(token.length > 0, true);
  
  // Verify token should be valid
  const isValid = await repository.verifyToken(token);
  assertEquals(isValid, true);
});

Deno.test("UserRepository - should register user after preregistration", async () => {
  const repository = await createUserRepository();
  
  // Preregister
  const email = "register@example.com";
  const token = await repository.preregister(email);
  
  // Register
  const password = "secure-password";
  const profile = {
    displayName: "Test User",
    avatarUrl: "https://example.com/avatar.jpg",
  };
  
  await repository.register(token, password, profile);
  
  // Verify user can be found by email
  const user = await repository.findByEmail(email);
  assertEquals(user?.email, email);
  assertEquals(user?.displayName, "Test User");
  assertEquals(user?.avatarUrl, "https://example.com/avatar.jpg");
});

Deno.test("UserRepository - should verify password correctly", async () => {
  const repository = await createUserRepository();
  
  // Create user
  const email = "password@example.com";
  const token = await repository.preregister(email);
  const password = "test-password-123";
  const profile = { displayName: "Password Test User", avatarUrl: "" };
  
  await repository.register(token, password, profile);
  
  // Get user to get userId
  const user = await repository.findByEmail(email);
  if (!user) throw new Error("User not found");
  
  // Verify correct password
  const isValidPassword = await repository.verifyPassword(user.id, password);
  assertEquals(isValidPassword, true);
  
  // Verify incorrect password
  const isInvalidPassword = await repository.verifyPassword(user.id, "wrong-password");
  assertEquals(isInvalidPassword, false);
});

Deno.test("UserRepository - should handle non-existent user password verification", async () => {
  const repository = await createUserRepository();
  
  const result = await repository.verifyPassword("non-existent-id", "any-password");
  assertEquals(result, false);
});

Deno.test("UserRepository - should find user by id", async () => {
  const repository = await createUserRepository();
  
  // Create user
  const email = "findbyid@example.com";
  const token = await repository.preregister(email);
  const profile = { displayName: "Find By ID User", avatarUrl: "" };
  
  await repository.register(token, "password", profile);
  
  // Find by email first to get the user
  const userByEmail = await repository.findByEmail(email);
  if (!userByEmail) throw new Error("User not found by email");
  
  // Find by id
  const userById = await repository.findById(userByEmail.id);
  assertEquals(userById?.id, userByEmail.id);
  assertEquals(userById?.email, email);
  assertEquals(userById?.displayName, "Find By ID User");
});

Deno.test("UserRepository - should return null for non-existent user by id", async () => {
  const repository = await createUserRepository();
  
  const user = await repository.findById("non-existent-id");
  assertEquals(user, null);
});

Deno.test("UserRepository - should return null for non-existent user by email", async () => {
  const repository = await createUserRepository();
  
  const user = await repository.findByEmail("nonexistent@example.com");
  assertEquals(user, null);
});

Deno.test("UserRepository - should throw error for invalid signup token", async () => {
  const repository = await createUserRepository();
  
  await assertThrows(
    async () => {
      await repository.register("invalid-token", "password", { displayName: "Test", avatarUrl: "" });
    },
    Error,
    "Invalid signup token"
  );
});

Deno.test("UserRepository - should throw error for invalid token verification", async () => {
  const repository = await createUserRepository();
  
  await assertThrows(
    async () => {
      await repository.verifyToken("invalid-token");
    },
    Error,
    "Invalid signup token"
  );
});

Deno.test("UserRepository - should throw error for expired token", async () => {
  const repository = await createUserRepository();
  
  // This test would require mocking time or creating an expired token
  // For now, we'll test the path with a token that doesn't exist
  await assertThrows(
    async () => {
      await repository.verifyToken("expired-token");
    },
    Error
  );
});

Deno.test("UserRepository - should update user status", async () => {
  const repository = await createUserRepository();
  
  // Create user
  const email = "status@example.com";
  const token = await repository.preregister(email);
  const profile = { displayName: "Status Test User", avatarUrl: "" };
  
  await repository.register(token, "password", profile);
  
  // Get user
  const user = await repository.findByEmail(email);
  if (!user) throw new Error("User not found");
  
  // Update status (this method exists but may not have validation in the interface)
  await repository.updateStatus(user.id, "suspend");
  
  // Note: We can't easily verify this without exposing the status in the user interface
  // But we're testing that the method runs without error
});

Deno.test("UserRepository - password hashing should be consistent", async () => {
  const password = "consistent-test";
  
  const hash1 = await generatePassowrdHash(password);
  const hash2 = await generatePassowrdHash(password);
  
  // Hashes should be different (due to different salts)
  assertEquals(hash1 !== hash2, true);
  
  // But both should have the correct format
  assertEquals(hash1.split(".").length, 2);
  assertEquals(hash2.split(".").length, 2);
});

Deno.test("UserRepository - should handle special characters in profile", async () => {
  const repository = await createUserRepository();
  
  const email = "special@example.com";
  const token = await repository.preregister(email);
  const profile = {
    displayName: "Test 特殊文字 User",
    avatarUrl: "https://example.com/picture.jpg",
  };
  
  await repository.register(token, "password", profile);
  
  const user = await repository.findByEmail(email);
  assertEquals(user?.displayName, "Test 特殊文字 User");
  assertEquals(user?.avatarUrl, "https://example.com/picture.jpg");
});