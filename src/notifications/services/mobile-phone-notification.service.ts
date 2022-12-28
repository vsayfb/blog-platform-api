import { Injectable } from '@nestjs/common';
import { TasksService } from 'src/global/tasks/tasks.service';
import {
  CodeProcess,
  VerificationCode,
} from 'src/verification_codes/entities/code.entity';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';
import { SmsService } from 'src/sms/sms.service';
import { INotificationService } from '../interfaces/notification-service.interface';

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
        process: CodeProcess.REGISTER_WITH_MOBIL_PHONE,
      });

      this.tasksService.execAfterGivenMinutes(
        () => this.verificationCodesService.deleteIfExists(verificationCode.id),
        5,
      );

      return verificationCode;
    }
  }

  async notifyForTFA(
    phone: string,
    process: CodeProcess,
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

      this.tasksService.execAfterGivenMinutes(
        () => this.verificationCodesService.deleteIfExists(verificationCode.id),
        2,
      );

      return verificationCode;
    }
  }

  notify(receiver: string, data: string): Promise<VerificationCode> {
    throw new Error('Method not implemented.');
  }
}
