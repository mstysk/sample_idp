import { Handlers } from "$fresh/src/server/types.ts";
import { create as createPasskey } from "../../../../src/Repository/Passkey.ts";
import {
  create as createChallege,
  isExpired,
  sameChallenge,
} from "../../../../src/Repository/Challenge.ts";
import { decodeClientData } from "../registration/verify.ts";
import { getRPId } from "../registration/options.ts";
import { createAuthenticateRepository } from "../../../../src/Modules/Authenticate/Authenticate.ts";
import { withSetCookie } from "../../../../src/Infra/Cookies.ts";
import { base64url } from "npm:jose";

export type AuthenticationResponseJSON = {
  id: string;
  rawId: string;
  type: string;
  authenticatorAttachment: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle: string;
  };
};

export const handler: Handlers = {
  async POST(req, _ctx) {
    const body = await req.json();

    const { username, credential } = body;

    if (!username || typeof username !== "string") {
      return new Response("Invalid username", { status: 400 });
    }

    if (!credential || !isAuthenticatePayload(credential)) {
      return new Response("Invalid credential", { status: 400 });
    }
    const challengeRepository = await createChallege();
    const challenge = await challengeRepository.findById(username);

    if (!challenge) {
      return new Response(
        JSON.stringify({ verified: false, message: "Challenge not found" }),
        { status: 400 },
      );
    }

    if (isExpired(challenge)) {
      return new Response(
        JSON.stringify({ verified: false, message: "Challenge expired" }),
        { status: 400 },
      );
    }

    const clientData = decodeClientData(credential.response.clientDataJSON);

    if (!sameChallenge(challenge.challenge, clientData.challenge)) {
      return new Response(
        JSON.stringify({
          verified: false,
          message: "Challenge does not match",
        }),
        { status: 400 },
      );
    }

    if (!clientData.origin.includes(getRPId())) {
      return new Response(
        JSON.stringify({
          verified: false,
          message: "Origin does not match",
        }),
        { status: 400 },
      );
    }

    const passkeyRepository = await createPasskey();
    const passkey = await passkeyRepository.findById(
      credential.id,
    );

    if (!passkey || passkey.userId !== username) {
      return new Response(
        JSON.stringify({
          verified: false,
          message: "Passkey not found",
        }),
        { status: 400 },
      );
    }

    try {
      const publicKeyBuffer = base64url.decode(passkey.publicKey);
      const publicKey = await crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        getHashAlgoritm(passkey.algorithm),
        true,
        ["verify"],
      );
      const clientDataHash = await crypto.subtle.digest(
        "SHA-256",
        base64url.decode(credential.response.clientDataJSON),
      );

      const authenticatorData = base64url.decode(
        credential.response.authenticatorData,
      );
      // 署名対象データを作成（authenticatorData + clientDataHash）
      const signatureBase = new Uint8Array(
        authenticatorData.byteLength + clientDataHash.byteLength,
      );
      signatureBase.set(new Uint8Array(authenticatorData), 0);
      signatureBase.set(
        new Uint8Array(clientDataHash),
        authenticatorData.byteLength,
      );
      // 署名を取得
      const signature = base64url.decode(credential.response.signature);

      const isValid = await crypto.subtle.verify(
        getHashAlgoritm(passkey.algorithm),
        publicKey,
        signature,
        signatureBase,
      );
      if (Deno.env.get("DEBUG")) {
        console.debug("Passkey signature verification:", {
          algorithm: getHashAlgoritm(passkey.algorithm),
          isValid,
          signatureBaseLength: signatureBase.byteLength,
          signatureLength: signature.byteLength,
        });
      }
      if (!isValid) {
        return new Response(
          JSON.stringify({
            verified: false,
            message: "Signature verification failed",
          }),
          { status: 400 },
        );
      }
    } catch (error) {
      console.error(
        "Passkey authentication error:",
        error instanceof Error ? error.message : String(error),
      );
      return new Response(
        JSON.stringify({
          verified: false,
          message: "Signature verification failed",
        }),
        { status: 400 },
      );
    }

    const authRepository = await createAuthenticateRepository();
    const accessToken = await authRepository.signin(username, "");

    await challengeRepository.delete(username);

    const url = new URL(req.url);
    const headers = withSetCookie(
      "sess",
      accessToken || "",
      url.hostname,
      new Headers(),
    );

    return new Response(
      JSON.stringify({
        verified: true,
        accessToken: accessToken,
      }),
      {
        headers,
        status: 200,
      },
    );
  },
};

function isAuthenticatePayload(
  payload: unknown,
): payload is AuthenticationResponseJSON {
  if (payload === null || typeof payload !== "object") {
    return false;
  }

  const p = payload as Record<string, unknown>;
  if (p.response === null || typeof p.response !== "object") {
    return false;
  }

  if (payload) {
    return "id" in payload &&
      "rawId" in payload &&
      "type" in payload &&
      "authenticatorAttachment" in payload &&
      "response" in payload &&
      "authenticatorData" in payload.response &&
      "clientDataJSON" in payload.response &&
      "signature" in payload.response &&
      "userHandle" in payload.response;
  }
  return true;
}

function getHashAlgoritm(alg: number): {
  name: string;
  hash: string;
} {
  switch (alg) {
    case -7:
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      };
    case -257:
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      };
    case -8:
      return {
        name: "ECDSA",
        hash: "SHA-256",
      };
    default:
      throw new Error(`Unsupported algorithm: ${alg}`);
  }
}
