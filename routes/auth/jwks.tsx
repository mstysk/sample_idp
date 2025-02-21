import { Handlers } from "$fresh/server.ts";
import { exportJWK } from "npm:jose";

import { getKeyId, getPublicKey } from "../../src/Infra/JWK.ts";

export const handler: Handlers = {
  async GET() {
    const jwk = await exportJWK(await getPublicKey());
    jwk.kid = getKeyId();
    return new Response(JSON.stringify({ keys: [jwk] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
