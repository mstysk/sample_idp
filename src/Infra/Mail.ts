import { MailSlurp } from "npm:mailslurp-client";
import * as nodemailer from "nodemailer";
import { MailContent, MailOpts, ToAddresss } from "../Repository/type.ts";

class MailService {
  private mailer;
  private fromAddress: string;

  constructor(opts: MailOpts, fromAddress: string) {
    this.mailer = nodemailer.createTransport(opts);
    this.fromAddress = fromAddress;
  }

  send(to: ToAddresss, content: MailContent): Promise<void> {
    const mess = { to, ...content, from: this.fromAddress };
    return this.mailer.sendMail(mess);
  }
}

const getMailSlurp = async (): Promise<MailOpts> => {
  const mailSlurp = new MailSlurp({
    apiKey: Deno.env.get("MAILSLURP_API_KEY") || "",
  });

  const server = await mailSlurp.getImapSmtpAccessDetails();

  return {
    host: server.smtpServerHost,
    port: server.smtpServerPort,
    auth: {
      user: server.smtpUsername,
      pass: server.smtpPassword,
      type: "PLAIN",
    },
  };
};

const getMailCatcer = (): Promise<MailOpts> => {
  return Promise.resolve({
    host: "localhost",
    port: 1025,
    auth: {
      user: "",
      pass: "",
      type: "PLAIN",
    },
  });
};

async function getMailer(mailer: string): Promise<MailOpts> {
  switch (mailer) {
    case "mailslurp":
      return await getMailSlurp();
    case "mailcatcher":
      return getMailCatcer();
    default:
      return getMailSlurp();
  }
}

export async function createMailer(): Promise<MailService> {
  const opts = await getMailer(Deno.env.get("MAILER") || "mailcatcher");
  const fromAddress = Deno.env.get("FROM_ADDRESS") || "sample@example.com";
  return new MailService(opts, fromAddress);
}
