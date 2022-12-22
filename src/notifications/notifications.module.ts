import { Module } from '@nestjs/common';
import { CodesModule } from 'src/codes/codes.module';
import { TasksModule } from 'src/global/tasks/tasks.module';
import { MailsModule } from 'src/mails/mails.module';
import { SmsModule } from 'src/sms/sms.module';
import { EmailNotificationService } from './services/email-notification.service';
import { MobilePhoneNotificationService } from './services/mobile-phone-notification.service';
import { NotificationFactory } from './services/notification-factory.service';

@Module({
  imports: [CodesModule, MailsModule, SmsModule, TasksModule],
  providers: [
    NotificationFactory,
    MobilePhoneNotificationService,
    EmailNotificationService,
  ],
  exports: [NotificationFactory],
})
export class NotificationsModule {}
