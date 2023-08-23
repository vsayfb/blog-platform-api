import { Injectable } from '@nestjs/common';
import { TasksService } from 'src/global/tasks/tasks.service';
import {
  CodeProcess,
  VerificationCode,
} from 'src/resources/verification_codes/entities/code.entity';
import { VerificationCodesService } from 'src/resources/verification_codes/verification-codes.service';
import { INotificationService } from '../interfaces/notification-service.interface';
import { MailsService } from 'src/mails/mails.service';

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
    const verificationCode = await this.codesService.create({
      receiver: email,
      process: CodeProcess.REGISTER_WITH_EMAIL,
    });

    try {
      await this.mailsService.sendTemplate(
        email,
        'Verification code',
        'verication_code',
        { username, code: verificationCode.code },
      );
    } catch (error) {
      this.codesService.delete(verificationCode);

      throw error;
    }

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

    try {
      await this.mailsService.send(
        receiver,
        'Verification Code',
        `<div>
      <div> Your verification code is here : <b> ${verificationCode.code} </b> </div>
            </div>`,
      );
    } catch (error) {
      this.codesService.delete(verificationCode);

      throw error;
    }

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
