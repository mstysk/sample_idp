import { MailSlurp } from "npm:mailslurp-client";
import * as nodemailer from "nodemailer";

type Message = {
  to: string;
  subject: string;
  text: string;
};

type typedOpts = {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
    type: string;
  };
};

export class MailService {
  private mailer;
  private static instance: MailService;
  private fromAddress: string;

  constructor(opts: typedOpts, fromAddress: string) {
    this.mailer = nodemailer.createTransport(opts);
    this.fromAddress = fromAddress;
  }

  send(message: Message): Promise<void> {
    const mess = { ...message, from: this.fromAddress };
    console.log(mess);
    return this.mailer.sendMail(mess);
  }

  static async createFromMailSlurp(): Promise<MailService> {
    if (this.instance) {
      return this.instance;
    }

    const mailSlurp = new MailSlurp({
      apiKey: Deno.env.get("MAILSLURP_API_KEY") || "",
    });

    const server = await mailSlurp.getImapSmtpAccessDetails();

    const opts = {
      host: server.smtpServerHost,
      port: server.smtpServerPort,
      auth: {
        user: server.smtpUsername,
        pass: server.smtpPassword,
        type: "PLAIN",
      },
    } as const;

    return new MailService(opts, server.emailAddress);
  }
}
