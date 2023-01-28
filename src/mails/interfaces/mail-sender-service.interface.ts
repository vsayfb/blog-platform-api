export interface IMailSenderService {
  send({ toMail, subject, content }): Promise<Object>;

  sendTemplate({
    toMail,
    subject,
    templateName,
    templateData,
  }: {
    toMail: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
  }): Promise<Object>;
}

export const IMailSenderService = Symbol('IMailSenderService');
