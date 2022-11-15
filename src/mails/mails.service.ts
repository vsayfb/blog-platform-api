import { Inject, Injectable } from '@nestjs/common';
import { CodesService } from 'src/codes/codes.service';
import { JobsService } from 'src/global/jobs/jobs.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { IMailSenderService } from './interfaces/mail-sender-service.interface';
import {
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';

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
    const alreadySent = await this.codeService.getOneByEmail(to.email);

    if (alreadySent) throw new BadRequestException(CodeMessages.ALREADY_SENT);

    const { code, codeID } = await this.codeService.create(to.email);

    const mailSent = await this.mailSenderService.sendVerificationMail(
      to,
      code,
    );

    if (!mailSent) {
      await this.codeService.delete(codeID);

      // TODO throw specific error and handle it in an exception filter then sent response

      throw new ServiceUnavailableException();
    }

    this.jobsService.execAfterTwoMinutes(() => this.codeService.delete(codeID));

    return { message: CodeMessages.CODE_SENT };
  }

  async sendMail(from: string, to: string, subject: string, data: any) {
    await this.mailSenderService.sendMail(from, to, subject, data);
  }
}
