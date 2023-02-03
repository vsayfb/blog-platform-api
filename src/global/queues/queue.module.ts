import { Global, Module } from '@nestjs/common';
import { ConsumersModule } from './consumers/consumers.module';
import { LoggingWorker } from './workers/logging.worker';
import { MailsWorker } from './workers/mails.worker';
import { NotificationsWorker } from './workers/notifications.worker';
import { SmsWorker } from './workers/sms.worker';

@Global()
@Module({
  imports: [ConsumersModule],
  providers: [MailsWorker, SmsWorker, NotificationsWorker, LoggingWorker],
  exports: [MailsWorker, SmsWorker, NotificationsWorker, LoggingWorker],
})
export class QueueModule {}
