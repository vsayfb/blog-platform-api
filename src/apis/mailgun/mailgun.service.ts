import { Injectable } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import * as formData from 'form-data';
import { ConfigService } from '@nestjs/config';
import Client from 'mailgun.js/client';
import {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MAILGUN_SENDER_MAIL,
  MAILGUN_USERNAME,
} from 'src/lib/env';

@Injectable()
export class MailgunService {
  private mailgun = new Mailgun(formData);
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = this.mailgun.client({
      username: configService.get<string>(MAILGUN_USERNAME),
      key: configService.get<string>(MAILGUN_API_KEY),
      url: 'https://api.eu.mailgun.net',
    });
  }

  async sendVerificationMail(
    to: { email: string; username: string },
    code: string,
  ) {
    return await this.client.messages.create(
      this.configService.get<string>(MAILGUN_DOMAIN),
      {
        from: this.configService.get<string>(MAILGUN_SENDER_MAIL),
        to: to.email,
        subject: 'Verification Code',
        template: 'verification_code',
        'h:X-Mailgun-Variables': JSON.stringify({
          code,
          username: to.username,
        }),
      },
    );
  }
}
