import { assertEquals } from "@std/assert";
import { generatePassowrdHash } from "../../../src/Repository/User.ts";

Deno.test("User - generatePassowrdHash should create hash with salt", async () => {
  const password = "test-password";
  const hash = await generatePassowrdHash(password);

  assertEquals(typeof hash, "string");
  assertEquals(hash.includes("."), true); // Should contain salt separator

  const parts = hash.split(".");
  assertEquals(parts.length, 2); // salt.hash format
  assertEquals(parts[0].length > 0, true); // salt part should exist
  assertEquals(parts[1].length > 0, true); // hash part should exist
});

Deno.test("User - generatePassowrdHash should create different hashes for same password", async () => {
  const password = "test-password";

  const hash1 = await generatePassowrdHash(password);
  const hash2 = await generatePassowrdHash(password);

  // Should be different due to different salts
  assertEquals(hash1 !== hash2, true);
});

Deno.test("User - generatePassowrdHash should create different hashes for different passwords", async () => {
  const password1 = "test-password-1";
  const password2 = "test-password-2";

  const hash1 = await generatePassowrdHash(password1);
  const hash2 = await generatePassowrdHash(password2);

  assertEquals(hash1 !== hash2, true);
});

Deno.test("User - generatePassowrdHash should handle empty password", async () => {
  const password = "";
  const hash = await generatePassowrdHash(password);

  assertEquals(typeof hash, "string");
  assertEquals(hash.includes("."), true);
});

Deno.test("User - generatePassowrdHash should handle long password", async () => {
  const password = "a".repeat(1000); // Very long password
  const hash = await generatePassowrdHash(password);

  assertEquals(typeof hash, "string");
  assertEquals(hash.includes("."), true);
});
