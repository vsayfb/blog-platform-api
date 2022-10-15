import { Module } from '@nestjs/common';
import { TwilioService } from 'src/apis/twilio/twilio.service';
import { ISmsSenderService } from './interfaces/sms-service.interface';
import { SmsService } from './sms.service';

@Module({
  providers: [
    SmsService,
    { provide: ISmsSenderService, useClass: TwilioService },
  ],
  exports: [SmsService],
})
export class SmsModule {}
