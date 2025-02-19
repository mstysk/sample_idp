import { Handlers, PageProps } from "$fresh/server.ts";
import { createUserRepository } from "../src/Repository/User.ts";
import { generateContent, PreregisterData } from "../src/Repository/Mailer.ts";
import { PRE_REGISTER_TEMPLATE } from "../src/Repository/Mailer.ts";
import { createMailer } from "../src/Infra/Mail.ts";

type SignupData = {
  message?: {
    message: string;
    color: "green" | "red" | "blue";
  };
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
    const existUser = await userRepsitory.findByEmail(email.toString());
    if (existUser) {
      return ctx.render({
        message: {
          message: "E-Mail already exists.",
          color: "red",
        },
        email: email.toString(),
      });
    }
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
      message: {
        message: "send pre-register message. Please check your E-Mail.",
        color: "green",
      },
      email: email.toString(),
    });
  },
  GET(_req, ctx) {
    return ctx.render({});
  },
};

export default function Signup({ data }: PageProps<SignupData>) {
  const colorVariant = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  };
  return (
    <>
      {data.message && (
        <p
          className={`${
            colorVariant[data.message.color || "blue"]
          } text-white p-4 font-bold mb-2 rounded-lg border`}
        >
          {data.message.message}
        </p>
      )}
      <h1 className="text-3xl font-bold mb-4">Signup</h1>
      <form className="flex flex-col" method="post">
        <label className="block mb-2" htmlFor="email">E-Mail</label>
        <input
          className="block w-full p-2 border border-gray-300 rounded-lg mb-4"
          type="email"
          id="email"
          name="email"
          value={data.email}
        />
        <button
          className="bg-blue-500 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"
          type="submit"
        >
          PreRegister
        </button>
      </form>
    </>
  );
}
