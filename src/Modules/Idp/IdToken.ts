import { JWTPayload, SignJWT } from "npm:jose";
import { UserType } from "../../Repository/User.ts";
import {
  AuthorizationQueryParams,
  EmailScope,
  OpenIdScope,
  PictureScope,
  ProfileScope,
  Scope,
} from "./Validator.ts";

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
    ...pickupClaims(user, params.scope),
  };
}

export async function encodeIdToken(
  payload: IdTokenPayload,
  keyId: string,
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT", kid: keyId })
    .sign(new TextEncoder().encode(Deno.env.get("JWT_SECRET") || ""));
}

export function pickupClaims(
  user: UserType,
  scopes: Scope[],
): Partial<UserType> {
  let payload = {};
  for (const scope of scopes) {
    switch (scope) {
      case ProfileScope:
        payload = { ...payload, ...{ name: user.displayName } };
        break;
      case EmailScope:
        payload = { ...payload, ...{ email: user.email } };
        break;
      case PictureScope:
        payload = { ...payload, ...{ picture: user.avatarUrl } };
        break;
    }
  }
  return payload;
}
