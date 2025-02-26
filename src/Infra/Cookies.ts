import { setCookie } from "@std/http/cookie";

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
