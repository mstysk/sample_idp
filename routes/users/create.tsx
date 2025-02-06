import { Handlers } from "$fresh/server.ts";
import {
  createUserRepository,
  generateToken,
  isProfile,
} from "../../src/Repository/User.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const formData = await req.formData();
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    console.log(formData);

    if (!username || !email || !password) {
      return new Response("Missing required fields");
    }

    const userRepsitory = await createUserRepository();
    const profile = {
      username,
      email,
    };

    if (!isProfile(profile)) {
      throw new Error("Invalid Argument");
    }
    await userRepsitory.store(
      profile,
      await generateToken(password.toString()),
    );

    console.log(userRepsitory);
    return Response.redirect("http://localhost:8000/", 302);
  },
};

export default function Create() {
  return (
    <>
      <h1>Create User</h1>
      <p>create user</p>
      <form method="post">
        <label for="username">username</label>
        <input type="text" id="username" name="username" />
        <label for="email">E-Mail</label>
        <input type="email" id="email" name="email" />
        <label for="password">Password</label>
        <input type="password" id="password" name="password" />
        <button type="submit">Create</button>
      </form>
    </>
  );
}
