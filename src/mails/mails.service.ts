import { Inject, Injectable } from '@nestjs/common';
import { IMailSenderService } from './interfaces/mail-sender-service.interface';
import { ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class MailsService {
  constructor(
    @Inject(IMailSenderService)
    private readonly mailSenderService: IMailSenderService,
  ) {}

  async sendVerificationCode(
    to: {
      email: string;
      username: string;
    },
    code: string,
  ): Promise<boolean> {
    try {
      await this.mailSenderService.sendVerificationMail(to, code);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async send(to: string[], subject: string, data: any) {
    try {
      await this.mailSenderService.sendMail(to, subject, data);
      return true;
    } catch (error) {
      throw error;
    }
  }
}
