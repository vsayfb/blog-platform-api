import { Injectable } from '@nestjs/common';
import { TasksService } from 'src/global/tasks/tasks.service';
import { VerificationCode } from 'src/global/verification_codes/entities/code.entity';
import { VerificationCodesService } from 'src/global/verification_codes/verification-codes.service';
import { MailsService } from 'src/mails/mails.service';
import { TFAProcess } from 'src/security/types/tfa-process';
import { INotificationService } from '../interfaces/notification-service.interface';

export enum EmailVerificationProcess {
  REGISTER_EMAIL = 'register_email_verification',
  CREATE_TFA_EMAIL = 'create_tfa_mail_verification',
  DISABLE_TFA = 'disable_tfa_verification',
}

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
        process: 'register_email',
      });

      this.tasksService.execAfterTwoMinutes(() =>
        this.codesService.deleteIfExists(verificationCode.id),
      );

      return verificationCode;
    }
  }

  async notifyForTFA(
    to: string,
    process: TFAProcess,
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
