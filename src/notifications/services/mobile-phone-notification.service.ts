import { Injectable } from '@nestjs/common';
import { TasksService } from 'src/global/tasks/tasks.service';
import {
  CodeProcess,
  VerificationCode,
} from 'src/verification_codes/entities/code.entity';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';
import { INotificationService } from '../interfaces/notification-service.interface';
import { SmsWorker } from 'src/global/queues/workers/sms.worker';

@Injectable()
export class MobilePhoneNotificationService implements INotificationService {
  constructor(
    private readonly smsWorker: SmsWorker,
    private readonly tasksService: TasksService,
    private readonly verificationCodesService: VerificationCodesService,
  ) {}

  async notifyForRegister(
    username: string,
    phone: string,
  ): Promise<VerificationCode> {
    const verificationCode = await this.verificationCodesService.create({
      receiver: phone,
      process: CodeProcess.REGISTER_WITH_MOBIL_PHONE,
    });

    this.smsWorker.produce(
      {
        to: phone,
        content: `Thanks for signing up @${username}. Your verification code is here - ${verificationCode.code}`,
      },
      255,
    );

    this.tasksService.execAfterGivenMinutes(
      () => this.verificationCodesService.deleteIfExists(verificationCode.id),
      5,
    );

    return verificationCode;
  }

  async notifyForTFA(
    phone: string,
    process: CodeProcess,
  ): Promise<VerificationCode> {
    const verificationCode = await this.verificationCodesService.create({
      receiver: phone,
      process,
    });

    this.smsWorker.produce({
      to: phone,
      content: `Your verification code is here - ${verificationCode.code}`,
    });

    this.tasksService.execAfterGivenMinutes(
      () => this.verificationCodesService.deleteIfExists(verificationCode.id),
      2,
    );

    return verificationCode;
  }

  notify(receiver: string, data: string): Promise<VerificationCode> {
    throw new Error('Method not implemented.');
  }
}
