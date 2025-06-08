import { assertEquals } from "@std/assert";
import {
  getKeyId,
  getPrivateKey,
  getPublicKey,
} from "../../../src/Infra/JWK.ts";

// Valid RSA key pairs for testing (2048-bit keys)
const testPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDY4g2/Z+92RtaD
HE429tVtQMZQkZ3JFb0X3larjEnHoh1h6LM0zCuHbCpTVw/sZymvYHgtwPHz+6xC
QY6UY2iTBsLJHF4UYSDM0W3hG/ViATRG8sOJq2Dc+Yh/jg7O5eVPziN0ESLJL7ii
Qy+JuuGBcB/cxLqv2wkcw9Avw5UNei386jzT6OjWbVMHXLMZoTzQ8Fm5eDU7MPHP
5aZxSQo0IRvQ0yKL7PmoStZTOVC11mMkuGeZcUe5LoflOIPqgPIjRA7/8U31qE1T
GLFMa260QfE+LGhpHNosQMjg+nBCElaUAHwpZ4JRQFWCCDv2hnH6yBHUpSf7y14R
sIneSFmBAgMBAAECggEABrm4kvqT12JUKEjdQ+0CxnxyY+TmmHnkoSYCYHepUWwF
gsvny/2vdT+zZq4D0N0cesdMRcCynhIMNAom9AL6xwmn+lsfX5zZEtHlISyUDwLe
HGu+eJ1Ga8bPCtPQoa3JTwijor+d6VDKDinUwmXXtKshuU+WUZIKe+Rmdyc2tuYg
DMxVQGm2XeAr+Lh58cLD1hV2+wgySEHznOGpJzVRd9FJ2MYSRg7YVlwJ8KHV5TCi
/QQDrdP8cxY27YYZQWjN8VQXobh6exKPhK+KMhSuHA/noZLlF/sWVvNz40XHaDgf
mvmC9dKuw4GPlGLn4sQkPa1av92B/OxHUx2RxXRdYQKBgQD60yR7esfqDsucHENr
7n4T97mA4ys5bBFXf2YJs/qW/yqfEnwdIZLRlu50LjO9UpMdNhvYRHbsWOUsnuyx
FVdBoLv5I3o9dTrlZJbBsgRunJxL4jHUiSGtbFWTpUPM+snWCaYkA/FaZDX+65k4
V9lor8cVuGpwT8O1CdE4egdZoQKBgQDdW6F2chYvl7laQHeuYFX8nCExOhNciKSi
2ZxC7AUmivxM6Fw0FOd3EQi0JKoOsLdvd1ghpoNGg/c1Zj/CMDOlz0C15OQYSRda
8x4iTiougBRgvtkBjXU9VUdSYccX3GiIFgoQffd7QbtbqRcjP1DK0g5JmHGMGaJ8
UGY2Dsez4QKBgQDfAi3Ur8ThYMg9g4+afhCQ9ldztgbvZhtBHV9+zwvFhxfBGTFK
wVgFi1l16MJN2QY+GabGMZE+8IbKln7Br8TF8ABRMe70h6+W10mG7B0ur4XznihJ
3KcZx1GLFYxjyrL739Zc/Thw8tpjTdwMEWeWwXqT4ESamQDbjN/9g9nXIQKBgQCI
zZOJN1L80OEtpQASVdluiDN/T+wdWRmex6xqM6GvQ2BQS56IVY8DqBRf+PTcpVyI
2BIwoc8p6m8CopGu+slApUjR4YcSd0Gm5O/vta0eFewCKpDFA968LBMrF+DKn14/
FJfdv2wO0f3v1R3Gm9/bqVxJIZyzQDiKacnxiMrlIQKBgDhgg/jkvUXNPzoEKxGc
QJMk39Jczdr0TzC3XLXgdoDSX253JGhVc0mW6I/hTIEpKNTvZbbHRyAHnVDz/q7e
1Rp4+XVw3HxRrh2qXZe2XDUxc06q9cclHhzGhk+VZvXo3W0AECMWZwG3OB0f7RL9
YbFOKsrwvCP8Siokxg8ffWUp
-----END PRIVATE KEY-----`;

const testPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2OINv2fvdkbWgxxONvbV
bUDGUJGdyRW9F95Wq4xJx6IdYeizNMwrh2wqU1cP7Gcpr2B4LcDx8/usQkGOlGNo
kwbCyRxeFGEgzNFt4Rv1YgE0RvLDiatg3PmIf44OzuXlT84jdBEiyS+4okMvibrh
gXAf3MS6r9sJHMPQL8OVDXot/Oo80+jo1m1TB1yzGaE80PBZuXg1OzDxz+WmcUkK
NCEb0NMii+z5qErWUzlQtdZjJLhnmXFHuS6H5TiD6oDyI0QO//FN9ahNUxixTGtu
tEHxPixoaRzaLEDI4PpwQhJWlAB8KWeCUUBVggg79oZx+sgR1KUn+8teEbCJ3khZ
gQIDAQAB
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

  try {
    await getPublicKey();
    throw new Error("Expected function to throw");
  } catch (error) {
    assertEquals((error as Error).message, "JWT_PUBLIC environment variable is required");
  }
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

  try {
    await getPrivateKey();
    throw new Error("Expected function to throw");
  } catch (error) {
    assertEquals((error as Error).message, "JWT_SECRET environment variable is required");
  }
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

  try {
    await getPublicKey();
    throw new Error("Expected function to throw");
  } catch (error) {
    assertEquals((error as Error).message, "JWT_PUBLIC environment variable is required");
  }

  try {
    await getPrivateKey();
    throw new Error("Expected function to throw");
  } catch (error) {
    assertEquals((error as Error).message, "JWT_SECRET environment variable is required");
  }

  // Cleanup
  Deno.env.delete("JWT_PUBLIC");
  Deno.env.delete("JWT_SECRET");
});
