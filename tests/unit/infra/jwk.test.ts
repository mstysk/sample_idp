import { assertEquals, assertThrows } from "@std/assert";
import { getPublicKey, getPrivateKey, getKeyId } from "../../../src/Infra/JWK.ts";

// Mock RSA key pairs for testing
const testPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGtJOBVhQg7Wzg
YvvG8VPm8E8rR7T6y1cHX5h2PbZ7B2Wq0CjyOqjqHg4I1cQXCjMqwFGtPm9bGpF4
IqB5HsyOqBjKjCzN2B3K8J8KJ8bm9QhK8XKzE1H8vZ9VgYqW7qkG5B2zY8C5qY2R
QGKz2B4X5vGY8J2KJZz7C8nQ3H9G7I6F8ZvL4m2XqYh6HKN8J7X5e3Y1NjZZ8vY7
H9K4F6YZqW2B6Y8h2m5QK4C9b2Y9j7B4K8X2n6I7ZqY3F8J7K1vQ4h6E9b2K7c3v
G8L4N2BqY7C1qH8Z3X6Y9K2L7C5vY1B4F2qH9K8X7Y3C6vH2Z4L9J8K6Q3vY2C1B
AgMBAAECggEAPkrZG8W3ZZ8J5K7C4L9Y2vH6Q3C8F4K2vY7ZB3L6F2J8Q9C7L4vY
K2H6B8C3F9G7J4Q2vY6K5C8L3Y7B9F4H6X2Q1C5vY8K7L3B2F9H4Y6Q3C8vL2K1J
Y7B4F6Q2C9K8L3Y5vH7B1F4Q6K2Y8C3L9vH5B7F2Q4K6Y1C8L3vY9B5F7H2Q6K4Y
C3L8vB9F5H7Q2K6Y4C1L3vY8B7F9H5Q2K6Y3C4L8vB1F9H7Q5K2Y6C3L4vY8B5F2H
Q9K7Y1C6L3vB4F8H5Q2K9Y7C3L6vB1F4H8Q5K2Y9C7L3vB6F1H4Q8K5Y2C9L7vB3F
QK2Y6C8L4vB5F7H1Q9K3Y2C6L8vB4F5H7Q1K9Y3C2L6vB8F4H5Q7K1Y9C5L3vB2F
wKBgQD8hZ4K7Y3C6vB1F2H9Q8K5Y7C4L3vB9F6H2Q1K8Y5C3L7vB4F9H6Q2K1Y8C
L6vB3F5H7Q4K2Y1C9L8vB6F3H1Q5K7Y4C2L9vB8F6H3Q1K5Y2C7L4vB1F8H9Q6K3Y
C5L2vB7F4H8Q1K6Y9C3L1vB5F7H4Q2K8Y6C9L3vB2F1H5Q7K4Y1C8L6vB3F9H2Q5K
wKBgQDJY8C3L6vB4F1H7Q2K9Y5C8L3vB7F4H6Q1K2Y9C5L8vB3F6H1Q4K7Y2C9L4v
B1F5H8Q3K6Y7C2L9vB5F3H4Q8K1Y6C7L2vB9F5H3Q1K8Y4C6L7vB2F1H9Q5K3Y8C
L1vB6F4H2Q7K9Y5C3L8vB1F7H5Q2K6Y9C4L3vB8F6H1Q5K2Y7C9L4vB3F8H6Q1K5Y
wKBgF7H3Q8K6Y2C9L4vB1F5H7Q3K8Y6C2L9vB4F3H1Q5K7Y9C8L6vB2F4H3Q1K5Y
C7L8vB9F6H4Q2K1Y5C3L7vB8F1H6Q9K4Y2C5L3vB7F8H1Q6K9Y3C4L2vB1F5H8Q7K
Y6C9L4vB3F2H5Q1K8Y7C6L9vB4F3H8Q2K5Y1C7L6vB9F4H2Q8K3Y5C1L8vB6F7H9Q
AoGBAJkF4H6Q2K5Y8C3L7vB1F9H5Q4K2Y6C8L3vB5F7H1Q9K4Y3C6L2vB8F5H7Q1K
Y9C4L6vB3F2H8Q5K7Y1C9L4vB6F3H5Q2K8Y7C5L1vB9F6H4Q3K2Y5C8L7vB1F4H9Q
K6Y3C2L5vB7F8H1Q4K9Y6C3L8vB2F5H7Q1K4Y9C6L3vB8F1H4Q7K2Y5C9L6vB3F8H
wKBgQCY1C6L8vB4F2H5Q9K3Y7C5L1vB8F6H3Q2K4Y9C7L2vB5F1H8Q6K3Y1C9L7vB
F4H2Q5K8Y6C3L9vB2F7H1Q4K5Y8C6L3vB9F4H7Q1K2Y5C8L6vB3F9H4Q7K1Y2C5L
vB8F6H9Q3K4Y7C1L2vB5F8H6Q9K3Y4C7L1vB6F2H5Q8K9Y3C4L7vB1F5H2Q6K8Y9C
==
-----END PRIVATE KEY-----`;

const testPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxrSTgVYUIO1s4GL7xvFT
5vBPK0e0+stXB1+Ydj22ewdlqtAo8jqo6h4OCNXEFwozKsBRrT5vWxqReCKgeR7M
jqgYyowszdgdyvCfCifG5vUIQvFysxNR/L2fVYGKlu6pBuQds2PAuamNkUBis9ge
F+bxmPCdiiWc+wvJ0Nx/RuyOhfGby+Jtl6mIehyjfCe1+Xt2NTY2WfL2Ox/SuBem
GaltgemPIdpuUCuAvW9mPY+weCvF9p+iO2amNxfCeytb0OIehPW9iu3N7xvC+Ddg
amOwtah/Gd1+mPSti+wub2NQeBdqh/SvF+2Nwur59meSyUm6Q9vY2gkLQIDAQAB
-----END PUBLIC KEY-----`;

Deno.test("JWK - getKeyId should return default key ID when not set", () => {
  // Clear environment variable
  Deno.env.delete("JWT_KEY_ID");
  
  const keyId = getKeyId();
  assertEquals(keyId, "DefaultKeyId");
});

Deno.test("JWK - getKeyId should return custom key ID when set", () => {
  Deno.env.set("JWT_KEY_ID", "test-key-id");
  
  const keyId = getKeyId();
  assertEquals(keyId, "test-key-id");
  
  // Cleanup
  Deno.env.delete("JWT_KEY_ID");
});

Deno.test("JWK - getPublicKey should throw error when JWT_PUBLIC not set", async () => {
  // Clear environment variable
  Deno.env.delete("JWT_PUBLIC");
  
  await assertThrows(
    async () => await getPublicKey(),
    Error,
  );
});

Deno.test("JWK - getPublicKey should work with valid public key", async () => {
  Deno.env.set("JWT_PUBLIC", testPublicKey);
  
  const publicKey = await getPublicKey();
  assertEquals(publicKey.type, "public");
  assertEquals(publicKey.algorithm.name, "RSASSA-PKCS1-v1_5");
  
  // Cleanup
  Deno.env.delete("JWT_PUBLIC");
});

Deno.test("JWK - getPublicKey should handle newline replacement", async () => {
  // Test with escaped newlines
  const keyWithEscapedNewlines = testPublicKey.replace(/\n/g, "\\n");
  Deno.env.set("JWT_PUBLIC", keyWithEscapedNewlines);
  
  const publicKey = await getPublicKey();
  assertEquals(publicKey.type, "public");
  
  // Cleanup
  Deno.env.delete("JWT_PUBLIC");
});

Deno.test("JWK - getPrivateKey should throw error when JWT_SECRET not set", async () => {
  // Clear environment variable
  Deno.env.delete("JWT_SECRET");
  
  await assertThrows(
    async () => await getPrivateKey(),
    Error,
  );
});

Deno.test("JWK - getPrivateKey should work with valid private key", async () => {
  Deno.env.set("JWT_SECRET", testPrivateKey);
  
  const privateKey = await getPrivateKey();
  assertEquals(privateKey.type, "private");
  assertEquals(privateKey.algorithm.name, "RSASSA-PKCS1-v1_5");
  
  // Cleanup
  Deno.env.delete("JWT_SECRET");
});

Deno.test("JWK - getPrivateKey should handle newline replacement", async () => {
  // Test with escaped newlines
  const keyWithEscapedNewlines = testPrivateKey.replace(/\n/g, "\\n");
  Deno.env.set("JWT_SECRET", keyWithEscapedNewlines);
  
  const privateKey = await getPrivateKey();
  assertEquals(privateKey.type, "private");
  
  // Cleanup
  Deno.env.delete("JWT_SECRET");
});

Deno.test("JWK - should handle empty string keys", async () => {
  Deno.env.set("JWT_PUBLIC", "");
  Deno.env.set("JWT_SECRET", "");
  
  await assertThrows(
    async () => await getPublicKey(),
    Error,
  );
  
  await assertThrows(
    async () => await getPrivateKey(),
    Error,
  );
  
  // Cleanup
  Deno.env.delete("JWT_PUBLIC");
  Deno.env.delete("JWT_SECRET");
});