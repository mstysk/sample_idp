import {deleteCookie} from "@std/http/cookie"
export const handler: Handlers = {
  async POST(req: Request, _ctx: any) {
    const headers = new Headers();
    deleteCookie(headers, 'sess');
    headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers
    });
  },
};
