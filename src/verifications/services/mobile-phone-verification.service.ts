import { Injectable } from '@nestjs/common';
import { CodesService } from 'src/codes/codes.service';
import { CodeVerificationProcess } from 'src/codes/entities/code.entity';
import { TasksService } from 'src/global/tasks/tasks.service';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class MobilePhoneVerificationService {
  constructor(
    private readonly smsService: SmsService,
    private readonly tasksService: TasksService,
    private readonly codesService: CodesService,
  ) {}

  async registerVerification({
    username,
    phone_number,
  }: {
    username: string;
    phone_number: string;
  }) {
    const code = this.codesService.generate();

    const sent = await this.smsService.sendSMS(
      phone_number,
      `Thanks for signing up @${username}. Your verification code is here - ${code}`,
    );

    const created = await this.codesService.create({
      receiver: phone_number,
      code,
      process: CodeVerificationProcess.REGISTER_MOBIL_PHONE,
    });

    if (sent) {
      this.tasksService.execAfterTwoMinutes(() =>
        this.codesService.deleteIfExists(created.id),
      );
    } else {
      this.codesService.delete(created);
    }
  }
}
