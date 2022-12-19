export interface IMailSenderService {
  sendVerificationMail(
    to: {
      email: string;
      username: string;
    },
    code: string,
  ): Promise<any>;

  sendMail(to: string[], subject: string, html: string): Promise<any>;
}

export const IMailSenderService = Symbol('IMailSenderService');
