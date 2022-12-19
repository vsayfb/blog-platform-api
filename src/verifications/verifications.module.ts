import { Module } from '@nestjs/common';
import { CodesModule } from 'src/codes/codes.module';
import { TasksModule } from 'src/global/tasks/tasks.module';
import { MailsModule } from 'src/mails/mails.module';
import { SmsModule } from 'src/sms/sms.module';
import { EmailVerificationService } from './services/email-verification.service';
import { MobilePhoneVerificationService } from './services/mobile-phone-verification.service';

@Module({
  imports: [CodesModule, MailsModule, SmsModule, TasksModule],
  providers: [MobilePhoneVerificationService, EmailVerificationService],
  exports: [MobilePhoneVerificationService, EmailVerificationService],
})
export class VerificationsModule {}
