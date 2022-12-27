import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { MailsModule } from './mails/mails.module';
import { MailgunModule } from './apis/mailgun/mailgun.module';
import { TasksModule } from './global/tasks/tasks.module';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';
import { CaslModule } from './global/casl/casl.module';
import { CommentsModule } from './comments/comments.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { FollowModule } from './follow/follow.module';
import { AccountsNotificationsModule } from './account_notifications/account-notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from 'ormconfig';
import { GatewaysModule } from './gateways/gateways.module';
import { EventsModule } from './global/events/events.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
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
import { ServeStaticModule } from '@nestjs/serve-static';
import { ExpressionsModule } from './expressions/expressions.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TwoFactorAuthModule } from './tfa/tfa.module';
import { ProfilesModule } from './profiles/profiles.module';
import { NotificationsModule } from './notifications/notifications.module';
import { VerificationCodesModule } from './verification_codes/verification-codes.module';
import { join } from 'path';

const imports = [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot(dataSource.options),
  RedisModule.forRoot({ url: process.env[ProcessEnv.REDIS_URL] }),
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
];

if (process.env.NODE_ENV === 'production') {
  imports.push(
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'client', 'build'),
      exclude: ['api/*'],
    }),
  );
}

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
  ],
})
export class AppModule {}
