import { withSetCookie } from "../../Infra/Cookies.ts";
import { deleteCookie, getCookies } from "@std/http/cookie";
import { UserType } from "../../Repository/User.ts";
import { decode } from "./Authenticate.ts";

export const AUTHED_REDIRECT_SESS_NAME = "authedRedirect";

export interface AuthCheck {
  (req: Request): Promise<Response | UserType>;
}

export interface GetAuthedRedirect {
  (req: Request): string | null;
}

export interface ClearAuthedRedirect {
  (headers: Headers): void;
}

const getAuthedRedirect: GetAuthedRedirect = function (req: Request) {
  const url = getCookies(req.headers);
  return url[AUTHED_REDIRECT_SESS_NAME];
};

const authCheck: AuthCheck = async function (req) {
  const sess = getCookies(req.headers)["sess"];
  if (!sess) {
    return await createSigninRedirectResponse(req);
  }
  console.log("authCheck sess", sess);
  const user = await decode(sess);
  console.log("authCheck user", user);
  if (!user) {
    return await createSigninRedirectResponse(req);
  }
  return user;
};

const clearAuthedRedirect: ClearAuthedRedirect = function (headers: Headers) {
  deleteCookie(headers, AUTHED_REDIRECT_SESS_NAME);
};

export { authCheck, clearAuthedRedirect, getAuthedRedirect };

function createSigninRedirectResponse(req: Request): Promise<Response> {
  const headers = new Headers();

  headers.set("Location", "/signin");

  return Promise.resolve(
    new Response(null, {
      status: 302,
      headers: withSetCookie(
        AUTHED_REDIRECT_SESS_NAME,
        req.url,
        new URL(req.url).hostname,
        headers,
      ),
    }),
  );
}
