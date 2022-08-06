import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { CodesService } from 'src/codes/codes.service';
import { JobsService } from 'src/global/jobs/jobs.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { ProcessEnv } from 'src/lib/enums/env';

@Injectable()
export class MailsService {
  private sender: string;

  constructor(
    private readonly mailgunService: MailgunService,
    private readonly codeService: CodesService,
    private readonly jobsService: JobsService,
    private readonly configService: ConfigService,
  ) {
    this.sender = this.configService.get<string>(
      ProcessEnv.MAILGUN_SENDER_MAIL,
    );
  }

  async sendVerificationCode(to: {
    email: string;
    username: string;
  }): Promise<{ message: string }> {
    const { code, codeID } = await this.codeService.createCode(to.email);

    await this.mailgunService.sendVerificationMail(to, code);

    this.jobsService.execAfterTwoMinutes(() =>
      this.codeService.removeCode(codeID),
    );

    return { message: CodeMessages.CODE_SENT };
  }
}
