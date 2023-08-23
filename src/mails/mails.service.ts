import { Inject, Injectable } from '@nestjs/common';
import { IMailSenderService } from './interfaces/mail-sender-service.interface';

@Injectable()
export class MailsService {
  constructor(
    @Inject(IMailSenderService)
    private readonly mailSenderService: IMailSenderService,
  ) {}

  async send(toMail: string, subject: string, content: string) {
    await this.mailSenderService.send({ toMail, subject, content });

    return true;
  }

  async sendTemplate(
    toMail: string,
    subject: string,
    templateName: string,
    templateData: Record<string, any>,
  ) {
    await this.mailSenderService.sendTemplate({
      toMail,
      subject,
      templateName,
      templateData,
    });

    return true;
  }
}
