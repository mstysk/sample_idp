import { Handlers } from "$fresh/src/server/types.ts";
import { base64url } from "npm:jose";
import { create } from "../../../../src/Repository/Passkey.ts";
import { create as createChallenge } from "../../../../src/Repository/Challenge.ts";
import { getRPId } from "../registration/options.ts";

type AllowCredential = {
  id: string;
  transports: string[];
  type: string;
};

type AutenticationOptions = {
  allowCredentials: AllowCredential[];
  challenge: string;
  hints: string[];
  rpId: string;
  timeout: number;
  userVerification: string;
};

export const handler: Handlers = {
  async POST(req, _ctx) {
    const param = await req.json();
    const { hints, user_verification, username } = param;
    console.log(param);

    const rpId = getRPId();
    const passkeyRepository = await create();
    const passkey = await passkeyRepository.findByUserId(username);

    if (passkey.length === 0) {
      return new Response("No passkey found", {
        status: 400,
      });
    }

    const challengeRepository = await createChallenge();

    const challenge = crypto.getRandomValues(new Uint8Array(16));

    await challengeRepository.save({
      id: username,
      challenge: challenge,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60000),
    });

    const body: AutenticationOptions = {
      allowCredentials: passkey.map((p) => ({
        id: p.id,
        transports: p.transports,
        type: "public-key",
      })),
      challenge: base64url.encode(challenge),
      hints,
      rpId,
      timeout: 60000,
      userVerification: user_verification,
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
