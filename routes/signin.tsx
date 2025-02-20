import { Handlers, PageProps } from "$fresh/server.ts";
import { createAuthenticateRepository } from "../src/Modules/Authenticate/Authenticate.ts";
import { getCookies, setCookie } from "jsr:@std/http/cookie";
import {
  clearAuthedRedirect,
  getAuthedRedirect,
  withSetCookie,
} from "../src/Modules/Authenticate/middleware.ts";

type SigninData = {
  message: string;
};

export const handler: Handlers = {
  async POST(req, ctx) {
    const formData = await req.formData();
    const email = formData.get("email");
    if (!email) {
      return ctx.render({
        message: "Missing required fields",
      });
    }
    const password = formData.get("password");
    if (!password) {
      return ctx.render({
        message: "Missing required fields",
      });
    }
    const authenticateRepository = await createAuthenticateRepository();
    const accessToken = await authenticateRepository.signin(
      email.toString(),
      password.toString(),
    );
    if (!accessToken) {
      return ctx.render({
        message: "invalid email or password",
      });
    }
    const url = new URL(req.url);
    const headers = withSetCookie(
      "sess",
      accessToken,
      url.hostname,
      new Headers(),
    );
    const authedRedirect = getAuthedRedirect(req);
    clearAuthedRedirect(headers);
    headers.set(
      "Location",
      authedRedirect ? authedRedirect : "/",
    );
    return new Response(null, { status: 303, headers });
  },

  GET(_req, ctx) {
    return ctx.render({});
  },
};

export default function Signin({ data }: PageProps<SigninData>) {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Signin</h1>
      {data.message && <p className="text-red-500 mt-4">{data.message}</p>}
      <p>{data.message}</p>
      <form method="post" className="flex flex-col">
        <label className="block mb-2" htmlFor="email">E-Mail</label>
        <input
          className="block w-full p-2 mb-4 border border-gray-300 rounded-lg"
          type="email"
          id="email"
          name="email"
        />
        <label className="block mb-2" htmlFor="password">Password</label>
        <input
          className="block w-full p-2 mb-4 border border-gray-300 rounded-lg"
          type="password"
          id="password"
          name="password"
        />
        <button
          className="bg-blue-500 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"
          type="submit"
        >
          Signin
        </button>
      </form>
    </>
  );
}
