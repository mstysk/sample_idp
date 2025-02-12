import { Handlers, PageProps } from "$fresh/server.ts";
import { createAuthenticateRepository } from "../src/Repository/Authenticate.ts";

type SigninData = {
  message: string;
};

export const handler: Handlers = {
  async POST(req, ctx) {
    const formData = await req.formData();
    const email = formData.get("email").toString();
    const password = formData.get("password").toString();
    const authenticateRepository = await createAuthenticateRepository();
    const authTokens = await authenticateRepository.signin(email, password);
    if (!authTokens) {
      return ctx.render({
        message: "invalid email or password",
      });
    }
    const url = new URL(req.url);
    url.pathname = "/";
    return Response.redirect(url);
  },
  GET(req, ctx) {
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
