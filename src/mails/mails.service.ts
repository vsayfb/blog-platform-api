import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { CodesService } from 'src/codes/codes.service';
import { JobsService } from 'src/global/jobs/jobs.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { ProcessEnv } from 'src/lib/enums/env';
import { IMailSenderService } from './interfaces/mail-sender-service.interface';

@Injectable()
export class MailsService {
  constructor(
    private readonly codeService: CodesService,
    private readonly jobsService: JobsService,
    @Inject(IMailSenderService)
    private readonly mailSenderService: IMailSenderService,
  ) {}

  async sendVerificationCode(to: {
    email: string;
    username: string;
  }): Promise<{ message: string }> {
    const { code, codeID } = await this.codeService.create(to.email);

    await this.mailSenderService.sendVerificationMail(to, code);

    this.jobsService.execAfterTwoMinutes(() => this.codeService.delete(codeID));

    return { message: CodeMessages.CODE_SENT };
  }
}
