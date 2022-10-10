export interface IMailSenderService {
  sendVerificationMail(
    to: {
      email: string;
      username: string;
    },
    code: string,
  ): Promise<void>;
}

export const IMailSenderService = Symbol('IMailSenderService');
