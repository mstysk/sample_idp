import { Handlers } from "$fresh/server.ts";
import { getRPId } from "./options.ts";
import { base64url } from "npm:jose";
import {
  create,
  isExpired,
  sameChallenge,
} from "../../../../src/Repository/Challenge.ts";
import { create as createPasskey } from "../../../../src/Repository/Passkey.ts";

type PublicKeyCredential = {
  authenticatorAttachment?: string;
  clientExtensionResults?: {
    [key: string]: string;
  };
  id: string;
  type: string;
  rawId: string;
  response: {
    attestationObject?: string;
    authenticatorData?: string;
    clientDataJSON: string;
    publicKey: string;
    publicKeyAlgorithm: number;
    transports: string[];
  };
};

type ClientData = {
  challenge: string;
  crossOrigin?: string;
  origin: string;
  tokenBinding?: {
    status: string;
    id: string;
  };
  topOrigin?: string;
  type: string;
};
export const handler: Handlers = {
  async POST(req, _ctx) {
    const body = await req.json();
    console.log(body);
    const { username, credential } = body;
    if (!username || typeof username !== "string") {
      return new Response("Missing username", {
        status: 400,
      });
    }

    if (!credential || !isPublicKeyCredential(credential)) {
      return new Response("Missing credential", {
        status: 400,
      });
    }

    const clientData = decodeClientData(credential.response.clientDataJSON);
    console.log(clientData);

    const challengeRepository = await create();
    const challenge = await challengeRepository.findById(username);

    if (!challenge) {
      console.log("Challenge not found", username);
      return new Response(JSON.stringify({ verified: false }));
    }
    if (
      isExpired(challenge) ||
      !sameChallenge(challenge.challenge, clientData.challenge)
    ) {
      console.log(
        "Challenge does not match",
        challenge.challenge,
        clientData.challenge,
      );
      return new Response(JSON.stringify({ verified: false }));
    }

    // verify origin
    if (!clientData.origin.includes(getRPId())) {
      console.log("Origin does not match", clientData.origin);
      return new Response(JSON.stringify({ verified: false }));
    }

    // save passkey
    const passkeyRepository = await createPasskey();
    await passkeyRepository.save({
      id: credential.id,
      userId: username,
      publicKey: credential.response.publicKey,
      algorithm: credential.response.publicKeyAlgorithm,
      transports: credential.response.transports,
    });
    await challengeRepository.delete(username);

    return new Response(JSON.stringify({ verified: true }));
  },
};

function isPublicKeyCredential(
  credential: unknown,
): credential is PublicKeyCredential {
  if (typeof credential !== "object" || credential === null) {
    return false;
  }
  return true;
}

export function decodeClientData(buf: string): ClientData {
  const byte = base64url.decode(buf);
  const str = new TextDecoder().decode(byte);
  return JSON.parse(str);
}
