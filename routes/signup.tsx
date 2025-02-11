import { Handlers, PageProps } from "$fresh/server.ts";
import { createUserRepository } from "../src/Repository/User.ts";
import { generateContent, PreregisterData } from "../src/Repository/Mailer.ts";
import { PRE_REGISTER_TEMPLATE } from "../src/Repository/Mailer.ts";
import { createMailer } from "../src/Infra/Mail.ts";

type SignupData = {
  message?: string;
  email?: string;
};

export const handler: Handlers = {
  async POST(req, ctx) {
    const formData = await req.formData();
    const email = formData.get("email");

    if (!email) {
      return new Response("Missing required fields");
    }

    const userRepsitory = await createUserRepository();
    const token = await userRepsitory.preregister(email.toString());

    const url = new URL(req.url);
    url.pathname = "/signup/verify";
    url.searchParams.append("token", token);

    const content = await generateContent<PreregisterData>(
      PRE_REGISTER_TEMPLATE,
      { url },
    );
    const mailer = await createMailer();
    await mailer.send(email.toString(), content);
    return ctx.render({
      message: "send pre-register message. Please check your E-Mail.",
      email: email.toString(),
    });
  },
  GET(_req, ctx) {
    return ctx.render({});
  },
};

export default function Signup({ data }: PageProps<SignupData>) {
  return (
    <>
      <p>{data.message}</p>
      <h1>Signup</h1>
      <form method="post">
        <label for="email">E-Mail</label>
        <input type="email" id="email" name="email" value={data.email} />
        <button type="submit">PreRegister</button>
      </form>
    </>
  );
}
