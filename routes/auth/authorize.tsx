import { Handlers } from "$fresh/server.ts";
import { getCookies } from "@std/http/cookie";
import {
  create,
  isAuthoizationQueryParams,
} from "../../src/Modules/Idp/Validator.ts";
import { verifyJWT } from "../../src/Infra/JWT.ts";
import { isUserType } from "../../src/Repository/User.ts";
import { generateIdTokenPayload } from "../../src/Modules/Idp/IdToken.ts";
import { createFromKV } from "../../src/Modules/Idp/Repositories/AuthCode.ts";

export const handler: Handlers = {
  async GET(req, _ctx) {
    const validator = create();
    const queryParams = new URL(req.url).searchParams;
    const params = await validator.validate(queryParams);

    if (!isAuthoizationQueryParams(params)) {
      return new Response("invalid params", { status: 400 });
    }
    const cookies = getCookies(req.headers);
    const payload = await verifyJWT(cookies.sess);
    if (!payload || !isUserType(payload)) {
      return new Response(null, {
        status: 302,
        headers: { location: "/signin" },
      });
    }
    const idTokenPayload = generateIdTokenPayload(payload, params);
    const authCodeRepository = await createFromKV();
    const authCode = await authCodeRepository.store(idTokenPayload);
    const redirectUrl = new URL(params.redirectUri);
    redirectUrl.searchParams.set("code", authCode);
    redirectUrl.searchParams.set("state", params.state);

    return new Response(null, {
      status: 302,
      headers: {
        location: redirectUrl.toString(),
      },
    });
  },
};

export default function Authroize() {
  return (
    <>
      <h1>Authroize</h1>
      <form method="post">
      </form>
    </>
  );
}
