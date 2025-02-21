import { Handlers } from "$fresh/server.ts";
import { exportJWK } from "npm:jose";

import { getPublicKey } from "../../src/Infra/JWK.ts";

export const handler: Handlers = {
  async GET() {
    const jwk = await exportJWK(await getPublicKey());
    return new Response(JSON.stringify({ keys: [jwk], hoge: "hoge" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
