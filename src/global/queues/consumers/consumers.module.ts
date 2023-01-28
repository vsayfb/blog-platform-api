import { Module } from '@nestjs/common';
import { AccountsNotificationsModule } from 'src/account_notifications/account-notifications.module';
import { CacheManagerModule } from 'src/cache/cache-manager.module';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { MailsModule } from 'src/mails/mails.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { SmsModule } from 'src/sms/sms.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { AccountNotificationsConsumer } from './account-notifications.consumer';
import { MailNotificationsConsumer } from './tfa-mail-notifications.consumer';
import { SmsNotificationsConsumer } from './sms-notifications.consumer';
import { RegisterMailsConsumer } from './register-mails.consumer';
import { SubscriberMailsConsumer } from './subscriber-mails.consumer';
import { SubscriberNotificationsConsumer } from './subscriber-notifications.consumer';

@Module({
  imports: [
    SubscriptionsModule,
    MailsModule,
    SmsModule,
    NotificationsModule,
    AccountsNotificationsModule,
    CacheManagerModule,
    GatewaysModule,
  ],
  providers: [
    AccountNotificationsConsumer,
    SubscriberNotificationsConsumer,
    SubscriberMailsConsumer,
    RegisterMailsConsumer,
    MailNotificationsConsumer,
    SmsNotificationsConsumer,
  ],
  exports: [
    AccountNotificationsConsumer,
    SubscriberNotificationsConsumer,
    SubscriberMailsConsumer,
    RegisterMailsConsumer,
    MailNotificationsConsumer,
    SmsNotificationsConsumer,
  ],
})
export class ConsumersModule {}
