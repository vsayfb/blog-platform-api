import { Module } from '@nestjs/common';
import { AccountsNotificationsModule } from 'src/resources/account_notifications/account-notifications.module';
import { CacheManagerModule } from 'src/cache/cache-manager.module';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { MailsModule } from 'src/mails/mails.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { SmsModule } from 'src/sms/sms.module';
import { SubscriptionsModule } from 'src/resources/subscriptions/subscriptions.module';
import { AccountNotificationsConsumer } from './account-notifications.consumer';
import { TfaMailNotificationsConsumer } from './tfa-mail-notifications.consumer';
import { SmsNotificationsConsumer } from './sms-notifications.consumer';
import { RegisterMailsConsumer } from './register-mails.consumer';
import { SubscriberMailsConsumer } from './subscriber-mails.consumer';
import { SubscriberNotificationsConsumer } from './subscriber-notifications.consumer';
import { LogsConsumer } from './logs.consumer';
import { LoggingModule } from 'src/logging/logging.module';

@Module({
  imports: [
    SubscriptionsModule,
    MailsModule,
    SmsModule,
    NotificationsModule,
    AccountsNotificationsModule,
    CacheManagerModule,
    GatewaysModule,
    LoggingModule,
  ],
  providers: [
    AccountNotificationsConsumer,
    SubscriberNotificationsConsumer,
    SubscriberMailsConsumer,
    RegisterMailsConsumer,
    TfaMailNotificationsConsumer,
    SmsNotificationsConsumer,
    LogsConsumer,
  ],
  exports: [
    AccountNotificationsConsumer,
    SubscriberNotificationsConsumer,
    SubscriberMailsConsumer,
    RegisterMailsConsumer,
    TfaMailNotificationsConsumer,
    SmsNotificationsConsumer,
    LogsConsumer,
  ],
})
export class ConsumersModule {}
