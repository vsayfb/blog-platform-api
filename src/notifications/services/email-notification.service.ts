import { Injectable } from '@nestjs/common';
import { TasksService } from 'src/global/tasks/tasks.service';
import {
  CodeProcess,
  VerificationCode,
} from 'src/verification_codes/entities/code.entity';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';
import { MailsService } from 'src/mails/mails.service';
import { INotificationService } from '../interfaces/notification-service.interface';

@Injectable()
export class EmailNotificationService implements INotificationService {
  constructor(
    private readonly mailsService: MailsService,
    private readonly tasksService: TasksService,
    private readonly codesService: VerificationCodesService,
  ) {}

  async notifyForRegister(
    username: string,
    email: string,
  ): Promise<VerificationCode> {
    const code = await this.codesService.generate();

    let sent = await this.mailsService.sendVerificationCode(
      { username, email },
      code,
    );

    if (sent) {
      const verificationCode = await this.codesService.create({
        receiver: email,
        code,
        process: CodeProcess.REGISTER_WITH_EMAIL,
      });

      this.tasksService.execAfterTwoMinutes(() =>
        this.codesService.deleteIfExists(verificationCode.id),
      );

      return verificationCode;
    }
  }

  async notifyForTFA(
    to: string,
    process: CodeProcess,
  ): Promise<VerificationCode> {
    const code = await this.codesService.generate();

    const sent = await this.mailsService.send(
      [to],
      'Verification Code',
      `<div>
        <div> Your verification code is here : <b> ${code} </b> </div>
      </div>`,
    );

    if (sent) {
      const verificationCode = await this.codesService.create({
        receiver: to,
        code,
        process,
      });

      this.tasksService.execAfterTwoMinutes(() =>
        this.codesService.deleteIfExists(verificationCode.id),
      );

      return verificationCode;
    }
  }

  notify(receiver: string, data: string): Promise<VerificationCode> {
    throw new Error('Method not implemented.');
  }
}
