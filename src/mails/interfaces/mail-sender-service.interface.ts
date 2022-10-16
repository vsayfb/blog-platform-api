export interface IMailSenderService {
  sendVerificationMail(
    to: {
      email: string;
      username: string;
    },
    code: string,
  ): Promise<void>;

  sendMail(
    from: string,
    to: string,
    subject: string,
    html: string,
  ): Promise<void>;
}

export const IMailSenderService = Symbol('IMailSenderService');
