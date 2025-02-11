import * as fs from "node:fs/promises";
import * as path from "jsr:@std/path";
import Handlebars from "npm:handlebars";
import { MailContent } from "./type.ts";

type MailTemplate<T> = {
  name: string;
  subject: string;
  path: string;
  data: T;
};

export interface PreregisterData {
  url: URL;
}

export const PRE_REGISTER_TEMPLATE = {
  name: "pre_register",
  subject: "Pre Register",
  path: "template/pre_register.md",
  data: {} as PreregisterData,
} as const;

export async function generateContent<TData extends object>(
  template: MailTemplate<TData>,
  data: TData,
): Promise<MailContent> {
  return {
    subject: template.subject,
    text: await generateMailContent(template.path, data),
  };
}

async function generateMailContent<TData extends object>(
  templatePath: string,
  data: TData,
): Promise<string> {
  const actualPath = path.resolve(templatePath);

  const templateSource = await fs.readFile(
    actualPath,
    "utf-8",
  );

  const temp = Handlebars.compile(templateSource);

  return temp(data);
}
