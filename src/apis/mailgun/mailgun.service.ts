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

  constructor(private readonly configService: ConfigService) {
    this.client = this.mailgun.client({
      username: configService.get<string>(ProcessEnv.MAILGUN_USERNAME),
      key: configService.get<string>(ProcessEnv.MAILGUN_API_KEY),
      url: configService.get<string>(ProcessEnv.MAILGUN_API_URL),
    });
  }

  async sendMail(
    to: string[],
    subject: string,
    html: string,
  ): Promise<MessagesSendResult> {
    const from = this.configService.get<string>(ProcessEnv.MAILGUN_SENDER_USER);

    try {
      return await this.client.messages.create(
        this.configService.get<string>(ProcessEnv.MAILGUN_DOMAIN),
        { from, to, subject, html },
      );
    } catch (error) {
      if (error.details.indexOf('not a valid') >= 0) {
        throw new BadRequestException('Invalid email address.');
      } else throw error;
    }
  }

  async sendVerificationMail(
    to: { email: string; username: string },
    code: string,
  ): Promise<MessagesSendResult> {
    const from = this.configService.get<string>(ProcessEnv.MAILGUN_SENDER_USER);

    try {
      return await this.sendTemplateMail(from, to.email, 'Verification Code', {
        template: 'verification_code',
        'h:X-Mailgun-Variables': JSON.stringify({
          code,
          username: to.username,
        }),
      });
    } catch (error: { status: number; details: string } | any) {
      if (error.details.indexOf('not a valid') >= 0) {
        throw new BadRequestException('Invalid email address.');
      } else throw error;
    }
  }

  private async sendTemplateMail(
    from: string,
    to: string,
    subject: string,
    options?: { [key: string]: any },
  ): Promise<MessagesSendResult> {
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

    return await this.client.messages.create(
      this.configService.get<string>(ProcessEnv.MAILGUN_DOMAIN),
      data as any,
    );
  }
}
