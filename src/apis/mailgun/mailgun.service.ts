import { BadRequestException, Injectable } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import * as formData from 'form-data';
import { ConfigService } from '@nestjs/config';
import Client from 'mailgun.js/client';
import { ProcessEnv } from 'src/lib/enums/env';
import { IMailSenderService } from 'src/mails/interfaces/mail-sender-service.interface';
import { MessagesSendResult } from 'mailgun.js/interfaces/Messages';

@Injectable()
export class MailgunService implements IMailSenderService {
  private mailgun = new Mailgun(formData);
  private client: Client;

  private domain = this.configService.get<string>(ProcessEnv.MAILGUN_DOMAIN);
  private sender = this.configService.get<string>(
    ProcessEnv.MAILGUN_SENDER_USER,
  );

  constructor(private readonly configService: ConfigService) {
    this.client = this.mailgun.client({
      username: configService.get<string>(ProcessEnv.MAILGUN_USERNAME),
      key: configService.get<string>(ProcessEnv.MAILGUN_API_KEY),
      url: configService.get<string>(ProcessEnv.MAILGUN_API_URL),
    });
  }
  async send({
    toMail,
    subject,
    content,
  }: {
    toMail: any;
    subject: any;
    content: any;
  }): Promise<MessagesSendResult> {
    try {
      return await this.client.messages.create(this.domain, {
        from: this.sender,
        to: toMail,
        subject,
        html: content,
      });
    } catch (error) {
      if (error.details.indexOf('not a valid') >= 0) {
        throw new BadRequestException('Invalid email address.');
      } else throw error;
    }
  }
  async sendTemplate({
    toMail,
    subject,
    templateName,
    templateData,
  }: {
    toMail: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
  }): Promise<MessagesSendResult> {
    console.log({
      from: this.sender,
      to: toMail,
      subject,
      template: templateName,
      'h:X-Mailgun-Variables': JSON.stringify(templateData),
    });

    try {
      return await this.client.messages.create(this.domain, {
        from: this.sender,
        to: toMail,
        subject,
        template: templateName,
        'h:X-Mailgun-Variables': JSON.stringify(templateData),
      });
    } catch (error) {
      console.log(error);

      if (error.details.indexOf('not a valid') >= 0) {
        throw new BadRequestException('Invalid email address.');
      } else throw error;
    }
  }
}
