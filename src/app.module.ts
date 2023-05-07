import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './resources/accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { MailsModule } from './mails/mails.module';
import { MailgunModule } from './apis/mailgun/mailgun.module';
import { TasksModule } from './global/tasks/tasks.module';
import { PostsModule } from './resources/posts/posts.module';
import { TagsModule } from './resources/tags/tags.module';
import { CaslModule } from './global/casl/casl.module';
import { CommentsModule } from './resources/comments/comments.module';
import { BookmarksModule } from './resources/bookmarks/bookmarks.module';
import { FollowModule } from './resources/follow/follow.module';
import { AccountsNotificationsModule } from './resources/account_notifications/account-notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from '../ormconfig';
import { GatewaysModule } from './gateways/gateways.module';
import { EventsModule } from './global/events/events.module';
import { ChatsModule } from './resources/chats/chats.module';
import { MessagesModule } from './resources/messages/messages.module';
import { RedisModule } from './global/redis/redis.module';
import { ProcessEnv } from './lib/enums/env';
import { CacheManagerModule } from './cache/cache-manager.module';
import { UrlManagementModule } from './global/url-management/url-management.module';
import { HashManagerModule } from './global/hash-manager/hash-manager.module';
import { SmsModule } from './sms/sms.module';
import { TwilioModule } from './apis/twilio/twilio.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './lib/exception-filters/all-exceptions.filter';
import { QueryFailedExceptionFilter } from './lib/exception-filters/query-failed.exception.filter';
import { ExpressionsModule } from './resources/expressions/expressions.module';
import { SubscriptionsModule } from './resources/subscriptions/subscriptions.module';
import { TwoFactorAuthModule } from './resources/tfa/tfa.module';
import { ProfilesModule } from './resources/profiles/profiles.module';
import { NotificationsModule } from './notifications/notifications.module';
import { VerificationCodesModule } from './resources/verification_codes/verification-codes.module';
import { RabbitModule } from './global/rabbit/rabbit.module';
import { QueueModule } from './global/queues/queue.module';
import { ConsumersModule } from './global/queues/consumers/consumers.module';
import { LoggingModule } from './logging/logging.module';
import { LoggingInterceptor } from './logging/interceptors/logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ElasticModule } from './global/elastic/elastic.module';

const imports = [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot(dataSource.options),
  RedisModule.forRoot({ url: process.env[ProcessEnv.REDIS_URL] }),
  RabbitModule.forRoot({ uri: process.env[ProcessEnv.RABBITMQ_URI] }),
  ElasticModule.forRoot({
    clientOpts: { node: process.env[ProcessEnv.ELASTIC_NODE] },
  }),
  AccountsModule,
  ProfilesModule,
  AuthModule,
  UploadsModule,
  MailsModule,
  MailgunModule,
  VerificationCodesModule,
  TasksModule,
  PostsModule,
  TagsModule,
  CaslModule,
  CommentsModule,
  BookmarksModule,
  FollowModule,
  ExpressionsModule,
  AccountsNotificationsModule,
  EventsModule,
  GatewaysModule,
  ChatsModule,
  MessagesModule,
  CacheManagerModule,
  UrlManagementModule,
  HashManagerModule,
  SmsModule,
  TwilioModule,
  SubscriptionsModule,
  TwoFactorAuthModule,
  NotificationsModule,
  QueueModule,
  ConsumersModule,
  LoggingModule,
];

@Module({
  imports,
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: QueryFailedExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
