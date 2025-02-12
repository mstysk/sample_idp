import { Handlers } from "$fresh/server.ts";
import { getCookies } from "@std/http/cookie";
import { verifyJWT } from "../src/Infra/JWT.ts";
import { PageProps } from "$fresh/server.ts";

type HomeData = {
  sub: string;
  email: string;
  displayName: string;
};

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    if (cookies.sess) {
      const payload = await verifyJWT(cookies.sess);
      if (!payload) {
        return new Response(null, {
          status: 302,
          headers: { location: "/signin" },
        });
      }
      return ctx.render({
        sub: payload.sub,
        email: payload.email,
        displayName: payload.displayName,
      });
    }
    return new Response(null, {
      status: 302,
      headers: { location: "/signin" },
    });
  },
};

export default function Home({ data }: PageProps<HomeData>) {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Welcome, {data.displayName}</h1>
      <p className="text-lg mb-4">{data.email}</p>
      <form method="post" action="/logout">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Logout
        </button>
      </form>
    </>
  );
}
