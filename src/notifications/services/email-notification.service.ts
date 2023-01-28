import { Injectable } from '@nestjs/common';
import { TasksService } from 'src/global/tasks/tasks.service';
import {
  CodeProcess,
  VerificationCode,
} from 'src/verification_codes/entities/code.entity';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';
import { INotificationService } from '../interfaces/notification-service.interface';
import { MailsWorker } from 'src/global/queues/workers/mails.worker';

@Injectable()
export class EmailNotificationService implements INotificationService {
  constructor(
    private readonly mailsWorker: MailsWorker,
    private readonly tasksService: TasksService,
    private readonly codesService: VerificationCodesService,
  ) {}

  async notifyForRegister(
    username: string,
    email: string,
  ): Promise<VerificationCode> {
    const verificationCode = await this.codesService.create({
      receiver: email,
      process: CodeProcess.REGISTER_WITH_EMAIL,
    });

    this.mailsWorker.produceRegisterEmails({
      to: email,
      subject: 'Verification code',
      template: 'verification_code',
      username,
      code: verificationCode.code,
    });

    this.tasksService.execAfterGivenMinutes(
      () => this.codesService.deleteIfExists(verificationCode.id),
      5,
    );

    return verificationCode;
  }

  async notifyForTFA(
    receiver: string,
    process: CodeProcess,
  ): Promise<VerificationCode> {
    const verificationCode = await this.codesService.create({
      receiver,
      process,
    });

    this.mailsWorker.produceTfaMails({
      to: receiver,
      subject: 'Verification Code',
      data: `<div>
      <div> Your verification code is here : <b> ${verificationCode.code} </b> </div>
            </div>`,
    });

    this.tasksService.execAfterGivenMinutes(
      () => this.codesService.deleteIfExists(verificationCode.id),
      2,
    );

    return verificationCode;
  }

  notify(receiver: string, data: string): Promise<VerificationCode> {
    throw new Error('Method not implemented.');
  }
}
