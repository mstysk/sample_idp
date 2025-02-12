import { Handlers } from "$fresh/server.ts";
import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import { getCookies } from "@std/http/cookie";
import { verifyJWT } from "../src/Infra/JWT.ts";
import { PageProps } from "$fresh/server.ts";

type HomeData = {
  sub: string;
  email: string;
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
      });
    }
    return new Response(null, {
      status: 302,
      headers: { location: "/signin" },
    });
  },
};

export default function Home({ data }: PageProps<HomeData>) {
  const count = useSignal(3);
  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      {data.sub && <p>{data.sub}</p>}
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="129"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>
        <Counter count={count} />
      </div>
    </div>
  );
}
