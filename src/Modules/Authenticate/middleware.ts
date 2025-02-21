import { deleteCookie, getCookies, setCookie } from "@std/http/cookie";
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
  const user = await decode(sess);
  if (!user) {
    return await createSigninRedirectResponse(req);
  }
  return user;
};

const clearAuthedRedirect: ClearAuthedRedirect = function (headers: Headers) {
  deleteCookie(headers, AUTHED_REDIRECT_SESS_NAME);
};

export { authCheck, clearAuthedRedirect, getAuthedRedirect };

async function createSigninRedirectResponse(req: Request): Promise<Response> {
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

export function withSetCookie(
  name: string,
  value: string,
  domain: string,
  headers: Headers,
  maxAge = 60 * 60 * 24 * 30,
): Headers {
  setCookie(headers, {
    name,
    value,
    httpOnly: true,
    secure: true,
    domain,
    maxAge,
    sameSite: "Lax",
    path: "/",
  });
  return headers;
}
