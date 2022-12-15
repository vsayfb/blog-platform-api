export interface IMailSenderService {
  sendVerificationMail(
    to: {
      email: string;
      username: string;
    },
    code: string,
  ): Promise<boolean>;

  sendMail(to: string[], subject: string, html: string): Promise<boolean>;
}

export const IMailSenderService = Symbol('IMailSenderService');
