import { Global, Module } from '@nestjs/common';
import { MailsModule } from 'src/mails/mails.module';
import { SmsModule } from 'src/sms/sms.module';
import { ConsumersModule } from './consumers/consumers.module';
import { MailsWorker } from './workers/mails.worker';
import { NotificationsWorker } from './workers/notifications.worker';
import { SmsWorker } from './workers/sms.worker';

@Global()
@Module({
  imports: [ConsumersModule],
  providers: [MailsWorker, SmsWorker, NotificationsWorker],
  exports: [MailsWorker, SmsWorker, NotificationsWorker],
})
export class QueueModule {}
