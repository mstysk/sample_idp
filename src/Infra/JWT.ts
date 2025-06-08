import { JWTPayload, jwtVerify, SignJWT } from "npm:jose";

function getSecret(): Uint8Array {
  const secretString = Deno.env.get("JWT_SECRET");
  if (!secretString) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secretString);
}

export async function createJWT(payload: JWTPayload): Promise<string> {
  const secret = getSecret();
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
  return jwt;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error instanceof Error ? error.message : String(error));
    return null;
  }
}
