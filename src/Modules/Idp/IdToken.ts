import { JWTPayload, SignJWT } from "npm:jose";
import { AuthorizationQueryParams } from "./Validator.ts";
import { UserType } from "../../Repository/User.ts";

export interface IdTokenPayload extends JWTPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  nonce: string | undefined;
}

type Issuer = string;

export function generateIdTokenPayload(
  user: UserType,
  params: AuthorizationQueryParams,
  iss?: Issuer,
): IdTokenPayload {
  if (!iss) {
    iss = Deno.env.get("ISSUER") || "https://localhost";
  }
  return {
    iss: iss,
    sub: user.id,
    aud: params.clientId,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    nonce: params.nonce,
  };
}

export async function encodeIdToken(payload: IdTokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(new TextEncoder().encode(Deno.env.get("JWT_SECRET") || ""));
}
