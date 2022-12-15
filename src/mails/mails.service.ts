import { Inject, Injectable } from '@nestjs/common';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { IMailSenderService } from './interfaces/mail-sender-service.interface';
import {
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { TasksService } from 'src/global/tasks/tasks.service';

@Injectable()
export class MailsService {
  constructor(
    private readonly codeService: CodesService,
    private readonly tasksService: TasksService,
    @Inject(IMailSenderService)
    private readonly mailSenderService: IMailSenderService,
  ) {}

  async sendVerificationCodeMail(to: {
    email: string;
    username: string;
  }): Promise<{ message: string }> {
    const alreadySent = await this.codeService.getOneByEmail(to.email);

    if (alreadySent) throw new BadRequestException(CodeMessages.ALREADY_SENT);

    const generatedCode = await this.codeService.create(to.email);

    const mailSent = await this.mailSenderService.sendVerificationMail(
      to,
      generatedCode.code,
    );

    if (!mailSent) {
      await this.codeService.delete(generatedCode);

      // TODO throw specific error and handle it in an exception filter then sent response

      throw new ServiceUnavailableException();
    }

    this.tasksService.execAfterTwoMinutes(() =>
      this.codeService.delete(generatedCode),
    );

    return { message: CodeMessages.CODE_SENT };
  }

  async sendMail(to: string[], subject: string, data: any) {
    await this.mailSenderService.sendMail(to, subject, data);
  }
}
