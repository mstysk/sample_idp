import { Handlers } from "$fresh/server.ts";
import { deleteCookie } from "@std/http/cookie";

export const handler: Handlers = {
  POST(req, _ctx) {
    const headers = new Headers();
    const url = new URL(req.url);
    deleteCookie(headers, "sess", { domain: url.hostname});
    headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers,
    });
  },
};
