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
    if (!ret) {
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
    if (!ret) {
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
      <h1 className="text-3xl font-bold mb-4">User Registration</h1>
      <form method="post" className="flex flex-col">
        <input type="hidden" name="token" value={data.token} />
        <label className="block mb-2" htmlFor="password">Password</label>
        <input
          className="block w-full p-2 mb-4 border border-gray-300 rounded-lg"
          type="password"
          id="password"
          name="password"
          autocomplete="new-password"
          required
        />
        <label className="block mb-2" htmlFor="displayName">DisplayName</label>
        <input
          className="block w-full p-2 mb-4 border border-gray-300 rounded-lg"
          type="text"
          id="displayName"
          name="displayName"
          required
        />
        <label className="block mb-2" htmlFor="avatarUrl">AvatarUrl</label>
        <input
          className="block w-full p-2 mb-4 border border-gray-300 rounded-lg"
          type="url"
          id="avatarUrl"
          name="avatarUrl"
        />
        <button
          className="bg-blue-500 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"
          type="submit"
        >
          Register
        </button>
      </form>
    </>
  );
}
