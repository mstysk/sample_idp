import { Handlers, PageProps } from "$fresh/server.ts";
import { createUserRepository } from "../../src/Repository/User.ts";

type VerifyTokenData = {
  token: string;
};

export const handler: Handlers = {
  async GET(req, ctx) {
    const params = new URL(req.url).searchParams;
    const token = params.get("token");
    if (!token) {
      throw new Error("invalid token");
    }
    const userRepsitory = await createUserRepository();
    const ret = await userRepsitory.verifyToken(token);
    if (ret) {
      throw new Error("invalid token");
    }
    return ctx.render({ token });
  },

  async POST(req, _ctx) {
    const form = await req.formData();
    const token = form.get("token")?.toString();
    const password = form.get("password")?.toString();
    const displayName = form.get("displayName")?.toString();
    const avatarUrl = form.get("avatarUrl")?.toString();

    if (!token) {
      throw new Error("invalid token");
    }

    const userRepsitory = await createUserRepository();
    const ret = await userRepsitory.verifyToken(token);
    if (ret) {
      throw new Error("invalid token");
    }
    if (!password) {
      throw new Error("invalid password");
    }
    await userRepsitory.register(token, password, {
      displayName,
      avatarUrl,
    });
    const url = new URL(req.url);
    url.pathname = "/signin";
    return Response.redirect(url);
  },
};
export default function Verify({ data }: PageProps<VerifyTokenData>) {
  return (
    <>
      <h1>User Registration</h1>
      <form method="post">
        <input type="hidden" name="token" value={data.token} />
        <label for="password">Password</label>
        <input type="password" id="password" name="password" />
        <label for="displayName">DisplayName</label>
        <input type="text" id="displayName" name="displayName" />
        <label for="avatarUrl">AvatarUrl</label>
        <input type="text" id="avatarUrl" name="avatarUrl" />
        <button type="submit">Register</button>
      </form>
    </>
  );
}
