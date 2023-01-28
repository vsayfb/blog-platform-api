import { Inject, Injectable } from '@nestjs/common';
import { MailgunMessageData } from 'mailgun.js/interfaces/Messages';
import { IMailSenderService } from './interfaces/mail-sender-service.interface';

@Injectable()
export class MailsService {
  constructor(
    @Inject(IMailSenderService)
    private readonly mailSenderService: IMailSenderService,
  ) {}

  async send(toMail: string, subject: string, content: string) {
    try {
      await this.mailSenderService.send({ toMail, subject, content });
      return true;
    } catch (error) {
      throw error;
    }
  }

  async sendTemplate(
    toMail: string,
    subject: string,
    templateName: string,
    templateData: Record<string, any>,
  ) {
    try {
      await this.mailSenderService.sendTemplate({
        toMail,
        subject,
        templateName,
        templateData,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
}
