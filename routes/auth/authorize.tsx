import { Handlers } from "$fresh/server.ts";
import {
  create,
  isAuthoizationQueryParams,
} from "../../src/Modules/Idp/Validator.ts";
import { isUserType } from "../../src/Repository/User.ts";
import { generateIdTokenPayload } from "../../src/Modules/Idp/IdToken.ts";
import { createFromKV } from "../../src/Modules/Idp/Repositories/AuthCode.ts";
import { authCheck } from "../../src/Modules/Authenticate/middleware.ts";

export const handler: Handlers = {
  async GET(req, _ctx) {
    const authCheckResult = await authCheck(req);
    if (!isUserType(authCheckResult)) {
      return authCheckResult;
    }
    const validator = create();
    const queryParams = new URL(req.url).searchParams;
    const params = await validator.validate(queryParams);

    if (!isAuthoizationQueryParams(params)) {
      return new Response("invalid params: " + JSON.stringify(params), {
        status: 400,
      });
    }
    const idTokenPayload = generateIdTokenPayload(
      authCheckResult,
      params,
      new URL(req.url).origin,
    );
    const authCodeRepository = await createFromKV();
    const authCode = await authCodeRepository.store(
      idTokenPayload,
      params.scope,
    );
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
