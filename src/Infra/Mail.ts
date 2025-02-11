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

const getMailSlurp = async (): Promise<
  { opts: MailOpts; fromAddress: string }
> => {
  const mailSlurp = new MailSlurp({
    apiKey: Deno.env.get("MAILSLURP_API_KEY") || "",
  });

  const server = await mailSlurp.getImapSmtpAccessDetails();

  return {
    opts: {
      host: server.smtpServerHost,
      port: server.smtpServerPort,
      auth: {
        user: server.smtpUsername,
        pass: server.smtpPassword,
        type: "PLAIN",
      },
    },
    fromAddress: server.emailAddress,
  };
};

export async function createMailer(): Promise<MailService> {
  const { opts, fromAddress } = await getMailSlurp();
  return new MailService(opts, fromAddress);
}
