import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { FollowNotificationsService } from './services/follow-notifications.service';
import { CommentsNotificationService } from './services/comments-notification.service';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { PostsNotificationService } from './services/posts.notification.service';
import { CacheManagerModule } from 'src/cache/cache-manager.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), CacheManagerModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    FollowNotificationsService,
    CommentsNotificationService,
    PostsNotificationService,
    { provide: MANAGE_DATA_SERVICE, useClass: NotificationsService },
  ],
  exports: [
    NotificationsService,
    FollowNotificationsService,
    CommentsNotificationService,
    PostsNotificationService,
  ],
})
export class AccountsNotificationsModule {}
