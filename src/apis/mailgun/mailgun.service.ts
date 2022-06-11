import { Injectable } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import * as formData from 'form-data';
import { ConfigService } from '@nestjs/config';
import Client from 'mailgun.js/client';

@Injectable()
export class MailgunService {
  private mailgun = new Mailgun(formData);
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = this.mailgun.client({
      username: 'foo',
      key: configService.get<string>('MAILGUN_API_KEY'),
    });
  }

  async sendMail(from: string, to: string, subject: string, text: string) {
    return await this.client.messages.create(
      this.configService.get<string>('MAILGUN_DOMAIN'),
      { from, to, subject, text },
    );
  }
}
