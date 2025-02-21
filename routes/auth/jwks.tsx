import { Handlers } from "$fresh/server.ts";
import { exportJWK } from "npm:jose";

import { publicKey } from "../../src/Infra/JWK.ts";

export const handler: Handlers = {
  async GET() {
    console.log("pub", publicKey);
    const jwk = await exportJWK(publicKey);
    return new Response(JSON.stringify({ keys: [jwk], hoge: "hoge" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
