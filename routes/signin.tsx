import { Handlers, PageProps } from "$fresh/server.ts";
import { createAuthenticateRepository } from "../src/Repository/Authenticate.ts";
import { setCookie } from "jsr:@std/http/cookie";

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
    const url = new URL(req.url)
    const headers = new Headers();
    setCookie(headers, {
      name: "sess",
      value: accessToken,
      httpOnly: true,
      secure: true,
      domain: url.hostname,
      maxAge: 120,
      sameSite: "Lax",
      path: "/",
    });
    headers.set("Location", "/");
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
        <p>{data.message}</p>
        <form method="post" className="flex flex-col">
          <label className="block mb-2" htmlFor="email">E-Mail</label>
          <input className="block w-full p-2 mb-4 border border-gray-300 rounded-lg" type="email" id="email" name="email" />
          <label className="block mb-2" htmlFor="password">Password</label>
          <input className="block w-full p-2 mb-4 border border-gray-300 rounded-lg" type="password" id="password" name="password" />
          <button className="bg-blue-500 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg" type="submit">Signin</button>
        </form>
    </>
  );
}
