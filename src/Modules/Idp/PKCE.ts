export const CODE_CHALLENGE_METHOD = "S256" as const;

const CODE_VERIFIER_MIN_LENGTH = 43;
const CODE_VERIFIER_MAX_LENGTH = 128;
const CODE_CHALLENGE_MIN_LENGTH = 43;
const CODE_CHALLENGE_MAX_LENGTH = 128;

// RFC 7636: unreserved characters [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
const CODE_VERIFIER_REGEX = /^[A-Za-z0-9\-._~]+$/;

// BASE64URL characters
const CODE_CHALLENGE_REGEX = /^[A-Za-z0-9\-_]+$/;

export function isValidCodeVerifier(codeVerifier: string): boolean {
  if (
    codeVerifier.length < CODE_VERIFIER_MIN_LENGTH ||
    codeVerifier.length > CODE_VERIFIER_MAX_LENGTH
  ) {
    return false;
  }
  return CODE_VERIFIER_REGEX.test(codeVerifier);
}

export function isValidCodeChallenge(codeChallenge: string): boolean {
  if (
    codeChallenge.length < CODE_CHALLENGE_MIN_LENGTH ||
    codeChallenge.length > CODE_CHALLENGE_MAX_LENGTH
  ) {
    return false;
  }
  return CODE_CHALLENGE_REGEX.test(codeChallenge);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generateCodeChallenge(
  codeVerifier: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(hash);
}

export async function verifyCodeChallenge(
  codeVerifier: string,
  codeChallenge: string,
): Promise<boolean> {
  const generatedChallenge = await generateCodeChallenge(codeVerifier);
  return generatedChallenge === codeChallenge;
}
