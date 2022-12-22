import { Injectable } from '@nestjs/common';
import { CodesService } from 'src/codes/codes.service';

import { TasksService } from 'src/global/tasks/tasks.service';
import { TFAProcess } from 'src/security/types/tfa-process';
import { SmsService } from 'src/sms/sms.service';
import { INotificationService } from '../interfaces/notification-service.interface';

export enum MobilePhoneVerificationProcess {
  REGISTER_MOBIL_PHONE = 'register_mobile_phone_verification',
  CREATE_TFA_SMS = 'create_tfa_sms_verification',
  DISABLE_TFA = 'disable_tfa_sms_verification',
}

@Injectable()
export class MobilePhoneNotificationService implements INotificationService {
  constructor(
    private readonly smsService: SmsService,
    private readonly tasksService: TasksService,
    private readonly codesService: CodesService,
  ) {}

  async notifyForRegister(username: string, phone: string): Promise<void> {
    const code = this.codesService.generate();

    const sent = await this.smsService.sendSMS(
      phone,
      `Thanks for signing up ${username}. Your verification code is here - ${code}`,
    );

    if (sent) {
      const { id } = await this.codesService.create({
        receiver: phone,
        code,
        process: 'register_mobile_phone',
      });

      this.tasksService.execAfterTwoMinutes(() =>
        this.codesService.deleteIfExists(id),
      );
    }
  }

  async notifyForTFA(phone: string, process: TFAProcess): Promise<void> {
    const code = this.codesService.generate();

    const sent = await this.smsService.sendSMS(
      phone,
      `Your verification code is here - ${code}`,
    );

    if (sent) {
      const { id } = await this.codesService.create({
        receiver: phone,
        code,
        process,
      });

      this.tasksService.execAfterTwoMinutes(() =>
        this.codesService.deleteIfExists(id),
      );
    }
  }

  notify(receiver: string, data: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
