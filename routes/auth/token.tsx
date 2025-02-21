import { Handlers } from "$fresh/server.ts";
import { createFromEnv } from "../../src/Modules/Idp/Repositories/Client.ts";
import { createFromKV } from "../../src/Modules/Idp/Repositories/AuthCode.ts";
import { encodeIdToken } from "../../src/Modules/Idp/IdToken.ts";
import {
  BEARER_TYPE,
  create,
} from "../../src/Modules/Idp/Repositories/AccessToken.ts";

type ClientId = string;
type ClientSecret = string;

export const handler: Handlers = {
  async POST(req, _ctx) {
    const formData = await req.formData();
    if (!await clientValidate(req.headers, formData)) {
      return new Response("Unauthorized", { status: 401 });
    }
    const code = formData.get("code");
    if (!code) {
      return new Response("invalid code", { status: 400 });
    }
    const authRepository = await createFromKV();
    const authCodeEntity = await authRepository.findByCode(code.toString());
    if (!authCodeEntity) {
      return new Response("invalid code", { status: 400 });
    }
    const idToken = await encodeIdToken(
      authCodeEntity.payload,
    );
    const accessTokenRepository = await create();
    const accessToken = await accessTokenRepository.save(
      authCodeEntity.payload.sub,
      authCodeEntity.scopes,
      BEARER_TYPE,
    );
    return new Response(
      JSON.stringify({
        id_token: idToken,
        access_token: accessToken,
        token_type: BEARER_TYPE,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  },
};

async function clientValidate(headers: Headers, formData: FormData) {
  const authHeader = headers.get("Authorization");
  if (authHeader) {
    return await basicAuthHeaderValidate(authHeader);
  }
  const clientId = formData.get("client_id");
  const clientSecret = formData.get("client_secret");
  if (!clientId || !clientSecret) {
    return false;
  }
  return await clientAuthenticate(clientId.toString(), clientSecret.toString());
}

async function basicAuthHeaderValidate(authHeader: string): Promise<boolean> {
  if (authHeader.startsWith("Basic ")) {
    const [username, password] = atob(authHeader.split(" ")[1]);
    return await clientAuthenticate(username, password);
  }
  return false;
}

async function clientAuthenticate(
  clientId: ClientId,
  secret: ClientSecret,
): Promise<boolean> {
  const clientRepository = createFromEnv();
  return await clientRepository.authenticate(clientId, secret);
}
