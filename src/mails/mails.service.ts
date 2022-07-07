import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { CodesService } from 'src/codes/codes.service';
import { MAILGUN_SENDER_MAIL } from 'src/lib/env';
import { JobsService } from 'src/jobs/jobs.service';
import { CodeMessages } from 'src/codes/enums/code-messages';

@Injectable()
export class MailsService {
  private sender: string;

  constructor(
    private readonly mailgunService: MailgunService,
    private readonly codeService: CodesService,
    private readonly jobsService: JobsService,
    private readonly configService: ConfigService,
  ) {
    this.sender = this.configService.get<string>(MAILGUN_SENDER_MAIL);
  }

  async sendVerificationCode(to: {
    email: string;
    username: string;
  }): Promise<{ message: string }> {
    const { code, id } = await this.codeService.createCode(to.email);

    await this.mailgunService.sendVerificationMail(to, code);

    this.jobsService.execAfterTwoMinutes(() => this.codeService.removeCode(id));

    return { message: CodeMessages.CODE_SENT };
  }
}
