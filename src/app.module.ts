import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { MailsModule } from './mails/mails.module';
import { MailgunModule } from './apis/mailgun/mailgun.module';
import { CodesModule } from './codes/codes.module';
import { JobsModule } from './global/jobs/jobs.module';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';
import { CaslModule } from './global/casl/casl.module';
import { CommentsModule } from './comments/comments.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { FollowModule } from './follow/follow.module';
import { NotificationsModule } from './global/notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from 'ormconfig';
import { GatewaysModule } from './gateways/gateways.module';
import { EventsModule } from './global/events/events.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { ExpressionsModule } from './expressions/expressions.module';
import { RedisModule } from './global/redis/redis.module';
import { ProcessEnv } from './lib/enums/env';
import { CacheManagerModule } from './cache/cache-manager.module';
import { UrlManagementModule } from './global/url-management/url-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSource.options),
    RedisModule.forRoot({ url: process.env[ProcessEnv.REDIS_URL] }),
    AccountsModule,
    AuthModule,
    UploadsModule,
    MailsModule,
    MailgunModule,
    CodesModule,
    JobsModule,
    PostsModule,
    TagsModule,
    CaslModule,
    CommentsModule,
    BookmarksModule,
    FollowModule,
    NotificationsModule,
    EventsModule,
    GatewaysModule,
    ChatsModule,
    MessagesModule,
    ExpressionsModule,
    CacheManagerModule,
    UrlManagementModule,
  ],
})
export class AppModule {}
