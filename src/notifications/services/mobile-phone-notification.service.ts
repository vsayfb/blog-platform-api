import { Injectable } from '@nestjs/common';
import { TasksService } from 'src/global/tasks/tasks.service';
import { VerificationCode } from 'src/global/verification_codes/entities/code.entity';
import { VerificationCodesService } from 'src/global/verification_codes/verification-codes.service';
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
    private readonly verificationCodesService: VerificationCodesService,
  ) {}

  async notifyForRegister(
    username: string,
    phone: string,
  ): Promise<VerificationCode> {
    const code = await this.verificationCodesService.generate();

    const sent = await this.smsService.sendSMS(
      phone,
      `Thanks for signing up ${username}. Your verification code is here - ${code}`,
    );

    if (sent) {
      const verificationCode = await this.verificationCodesService.create({
        receiver: phone,
        code,
        process: 'register_mobile_phone',
      });

      this.tasksService.execAfterTwoMinutes(() =>
        this.verificationCodesService.deleteIfExists(verificationCode.id),
      );

      return verificationCode;
    }
  }

  async notifyForTFA(
    phone: string,
    process: TFAProcess,
  ): Promise<VerificationCode> {
    const code = await this.verificationCodesService.generate();

    const sent = await this.smsService.sendSMS(
      phone,
      `Your verification code is here - ${code}`,
    );

    if (sent) {
      const verificationCode = await this.verificationCodesService.create({
        receiver: phone,
        code,
        process,
      });

      this.tasksService.execAfterTwoMinutes(() =>
        this.verificationCodesService.deleteIfExists(verificationCode.id),
      );

      return verificationCode;
    }
  }

  notify(receiver: string, data: string): Promise<VerificationCode> {
    throw new Error('Method not implemented.');
  }
}
