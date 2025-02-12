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
    const host = req.headers.get("host") || "http://localhost:8000";
    const url = new URL(host);
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
      <h1>Signin</h1>
      <p>{data.message}</p>
      <form method="post">
        <label for="email">E-Mail</label>
        <input type="email" id="email" name="email" />
        <label for="password">Password</label>
        <input type="password" id="password" name="password" />
        <button type="submit">Signin</button>
      </form>
    </>
  );
}
