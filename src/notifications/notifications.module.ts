import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { FollowNotificationsService } from './services/follow-notifications.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    FollowNotificationsService,
    { provide: 'SERVICE', useClass: NotificationsService },
  ],
})
export class NotificationsModule {}
