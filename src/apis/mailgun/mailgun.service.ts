import { Injectable } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import * as formData from 'form-data';
import { ConfigService } from '@nestjs/config';
import Client from 'mailgun.js/client';
import { ProcessEnv } from 'src/lib/enums/env';
import { IMailSenderService } from 'src/mails/interfaces/mail-sender-service.interface';

@Injectable()
export class MailgunService implements IMailSenderService {
  private mailgun = new Mailgun(formData);
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = this.mailgun.client({
      username: configService.get<string>(ProcessEnv.MAILGUN_USERNAME),
      key: configService.get<string>(ProcessEnv.MAILGUN_API_KEY),
      url: configService.get<string>(ProcessEnv.MAILGUN_API_URL),
    });
  }

  async sendMail(
    from: string,
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    try {
      await this.client.messages.create(
        this.configService.get<string>(ProcessEnv.MAILGUN_DOMAIN),
        { from, to, subject, html },
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  async sendVerificationMail(
    to: { email: string; username: string },
    code: string,
  ): Promise<boolean> {
    const from = this.configService.get<string>(ProcessEnv.MAILGUN_SENDER_MAIL);

    
      return await this.sendTemplateMail(from, to.email, 'Verification Code', {
        template: 'verification_code',
        'h:X-Mailgun-Variables': JSON.stringify({
          code,
          username: to.username,
        }),
      });
    
  }

  private async sendTemplateMail(
    from: string,
    to: string,
    subject: string,
    options?: { [key: string]: any },
  ) {
    const data = {
      from,
      to,
      subject,
    };

    if (options) {
      for (const key in options) {
        data[key] = options[key];
      }
    }

    try {
      const r = await this.client.messages.create(
        this.configService.get<string>(ProcessEnv.MAILGUN_DOMAIN),
        data as any,
      );

      return true;
    } catch (error) {
      
      return false;
    }
  }
}
