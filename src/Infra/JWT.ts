import { JWTPayload, jwtVerify, SignJWT } from "npm:jose";

const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET") || "");

export async function createJWT(payload: JWTPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
  return jwt;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.log("Invalid JWT:", error);
    return null;
  }
}
