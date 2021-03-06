import { Injectable } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import * as formData from 'form-data';
import { ConfigService } from '@nestjs/config';
import Client from 'mailgun.js/client';
import { ProcessEnv } from 'src/lib/enums/env';

@Injectable()
export class MailgunService {
  private mailgun = new Mailgun(formData);
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = this.mailgun.client({
      username: configService.get<string>(ProcessEnv.MAILGUN_USERNAME),
      key: configService.get<string>(ProcessEnv.MAILGUN_API_KEY),
      url: 'https://api.eu.mailgun.net',
    });
  }

  private async sendMail(
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

    await this.client.messages.create(
      this.configService.get<string>(ProcessEnv.MAILGUN_DOMAIN),
      data as any,
    );
  }

  async sendVerificationMail(
    to: { email: string; username: string },
    code: string,
  ) {
    const from = this.configService.get<string>(ProcessEnv.MAILGUN_SENDER_MAIL);

    await this.sendMail(from, to.email, 'Verification Code', {
      template: 'verification_code',
      'h:X-Mailgun-Variables': JSON.stringify({
        code,
        username: to.username,
      }),
    });

    return true;
  }
}
