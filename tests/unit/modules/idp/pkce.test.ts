import { assertEquals } from "@std/assert";
import {
  CODE_CHALLENGE_METHOD,
  generateCodeChallenge,
  isValidCodeChallenge,
  isValidCodeVerifier,
  verifyCodeChallenge,
} from "../../../../src/Modules/Idp/PKCE.ts";

// RFC 7636 Appendix B test vector
const TEST_VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const TEST_CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

Deno.test("PKCE - CODE_CHALLENGE_METHOD should be S256", () => {
  assertEquals(CODE_CHALLENGE_METHOD, "S256");
});

Deno.test("PKCE - generateCodeChallenge should generate correct challenge from RFC test vector", async () => {
  const challenge = await generateCodeChallenge(TEST_VERIFIER);
  assertEquals(challenge, TEST_CHALLENGE);
});

Deno.test("PKCE - verifyCodeChallenge should return true for valid pair", async () => {
  const result = await verifyCodeChallenge(TEST_VERIFIER, TEST_CHALLENGE);
  assertEquals(result, true);
});

Deno.test("PKCE - verifyCodeChallenge should return false for invalid pair", async () => {
  const result = await verifyCodeChallenge("wrong-verifier", TEST_CHALLENGE);
  assertEquals(result, false);
});

Deno.test("PKCE - verifyCodeChallenge should return false for modified challenge", async () => {
  const result = await verifyCodeChallenge(TEST_VERIFIER, "wrong-challenge");
  assertEquals(result, false);
});

// isValidCodeVerifier tests
Deno.test("PKCE - isValidCodeVerifier should return true for valid 43 char verifier", () => {
  const verifier = "a".repeat(43);
  assertEquals(isValidCodeVerifier(verifier), true);
});

Deno.test("PKCE - isValidCodeVerifier should return true for valid 128 char verifier", () => {
  const verifier = "a".repeat(128);
  assertEquals(isValidCodeVerifier(verifier), true);
});

Deno.test("PKCE - isValidCodeVerifier should return false for too short verifier", () => {
  const verifier = "a".repeat(42);
  assertEquals(isValidCodeVerifier(verifier), false);
});

Deno.test("PKCE - isValidCodeVerifier should return false for too long verifier", () => {
  const verifier = "a".repeat(129);
  assertEquals(isValidCodeVerifier(verifier), false);
});

Deno.test("PKCE - isValidCodeVerifier should return true for unreserved characters", () => {
  const verifier = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm0123456";
  assertEquals(isValidCodeVerifier(verifier), true);
});

Deno.test("PKCE - isValidCodeVerifier should return true for special unreserved chars", () => {
  const verifier = "abcdefghijklmnopqrstuvwxyz0123456789-._~abc";
  assertEquals(isValidCodeVerifier(verifier), true);
});

Deno.test("PKCE - isValidCodeVerifier should return false for invalid characters", () => {
  const verifier = "abcdefghijklmnopqrstuvwxyz0123456789+/=abc";
  assertEquals(isValidCodeVerifier(verifier), false);
});

// isValidCodeChallenge tests
Deno.test("PKCE - isValidCodeChallenge should return true for valid 43 char challenge", () => {
  const challenge = "a".repeat(43);
  assertEquals(isValidCodeChallenge(challenge), true);
});

Deno.test("PKCE - isValidCodeChallenge should return true for valid 128 char challenge", () => {
  const challenge = "a".repeat(128);
  assertEquals(isValidCodeChallenge(challenge), true);
});

Deno.test("PKCE - isValidCodeChallenge should return false for too short challenge", () => {
  const challenge = "a".repeat(42);
  assertEquals(isValidCodeChallenge(challenge), false);
});

Deno.test("PKCE - isValidCodeChallenge should return false for too long challenge", () => {
  const challenge = "a".repeat(129);
  assertEquals(isValidCodeChallenge(challenge), false);
});

Deno.test("PKCE - isValidCodeChallenge should return true for BASE64URL characters", () => {
  const challenge = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm0123456";
  assertEquals(isValidCodeChallenge(challenge), true);
});

Deno.test("PKCE - isValidCodeChallenge should return true for BASE64URL special chars", () => {
  const challenge = "abcdefghijklmnopqrstuvwxyz0123456789-_abcde";
  assertEquals(isValidCodeChallenge(challenge), true);
});

Deno.test("PKCE - isValidCodeChallenge should return false for non-BASE64URL chars", () => {
  const challenge = "abcdefghijklmnopqrstuvwxyz0123456789+/=abc";
  assertEquals(isValidCodeChallenge(challenge), false);
});

Deno.test("PKCE - isValidCodeChallenge should return true for RFC test vector", () => {
  assertEquals(isValidCodeChallenge(TEST_CHALLENGE), true);
});

Deno.test("PKCE - isValidCodeVerifier should return true for RFC test vector", () => {
  assertEquals(isValidCodeVerifier(TEST_VERIFIER), true);
});
