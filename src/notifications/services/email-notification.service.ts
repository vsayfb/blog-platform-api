import { Injectable } from '@nestjs/common';
import { CodesService } from 'src/codes/codes.service';
import { TasksService } from 'src/global/tasks/tasks.service';
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
    private readonly codesService: CodesService,
  ) {}

  async notifyForRegister(username: string, email: string): Promise<void> {
    const code = this.codesService.generate();

    let sent = await this.mailsService.sendVerificationCode(
      { username, email },
      code,
    );

    if (sent) {
      const { id } = await this.codesService.create({
        receiver: email,
        code,
        process: 'register_email',
      });

      this.tasksService.execAfterTwoMinutes(() =>
        this.codesService.deleteIfExists(id),
      );
    }
  }

  async notifyForTFA(to: string, process: TFAProcess): Promise<void> {
    const code = this.codesService.generate();

    const sent = await this.mailsService.send(
      [to],
      'Verification Code',
      `<div>
        <div> Your verification code is here : <b> ${code} </b> </div>
      </div>`,
    );

    if (sent) {
      const { id } = await this.codesService.create({
        receiver: to,
        code,
        process,
      });

      this.tasksService.execAfterTwoMinutes(() =>
        this.codesService.deleteIfExists(id),
      );
    }
  }

  async notify(email: string, data: string) {}
}
