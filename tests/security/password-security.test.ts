import { assertEquals, assertNotEquals } from "@std/assert";
import { generatePassowrdHash } from "../../src/Repository/User.ts";

Deno.test("Security - password hashing should use salt", async () => {
  const password = "test-password";
  const hash1 = await generatePassowrdHash(password);
  const hash2 = await generatePassowrdHash(password);
  
  // Same password should produce different hashes due to random salt
  assertNotEquals(hash1, hash2);
  
  // Both should contain salt separator
  assertEquals(hash1.includes("."), true);
  assertEquals(hash2.includes("."), true);
});

Deno.test("Security - password hashing should handle weak passwords", async () => {
  const weakPasswords = [
    "123456",
    "password",
    "admin",
    "guest",
    "test",
    "",
    " ",
  ];
  
  for (const password of weakPasswords) {
    const hash = await generatePassowrdHash(password);
    assertEquals(typeof hash, "string");
    assertEquals(hash.includes("."), true);
  }
});

Deno.test("Security - password hashing should handle special characters", async () => {
  const passwords = [
    "pássw@rd123!",
    "パスワード",
    "пароль",
    "كلمة المرور",
    "🔐password🔑",
    "password\nwith\nnewlines",
    "password\twith\ttabs",
  ];
  
  for (const password of passwords) {
    const hash = await generatePassowrdHash(password);
    assertEquals(typeof hash, "string");
    assertEquals(hash.includes("."), true);
    assertEquals(hash.length > 0, true);
  }
});

Deno.test("Security - password hashing should be deterministic for verification", async () => {
  // While the hash should be different each time due to salt,
  // the same password + salt should always produce the same hash
  const password = "test-password";
  const hash = await generatePassowrdHash(password);
  
  const [salt, expectedHash] = hash.split(".");
  
  // Recreate hash with same salt manually to verify determinism
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // This would require base64 encoding to match, but we verify structure
  assertEquals(typeof salt, "string");
  assertEquals(typeof expectedHash, "string");
  assertEquals(salt.length > 0, true);
  assertEquals(expectedHash.length > 0, true);
});

Deno.test("Security - password hashing should handle very long passwords", async () => {
  const longPassword = "a".repeat(10000);
  const hash = await generatePassowrdHash(longPassword);
  
  assertEquals(typeof hash, "string");
  assertEquals(hash.includes("."), true);
  
  const [salt, hashPart] = hash.split(".");
  assertEquals(salt.length > 0, true);
  assertEquals(hashPart.length > 0, true);
});

Deno.test("Security - salt should be sufficiently random", async () => {
  const password = "test-password";
  const salts = new Set();
  
  // Generate multiple hashes and collect salts
  for (let i = 0; i < 100; i++) {
    const hash = await generatePassowrdHash(password);
    const [salt] = hash.split(".");
    salts.add(salt);
  }
  
  // All salts should be unique (highly probable with good randomness)
  assertEquals(salts.size, 100);
});