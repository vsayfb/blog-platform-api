import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { NotificationsGatewayService } from 'src/gateways/services/notifications-gateway.service';
import { FollowNotificationsService } from 'src/notifications/services/follow-notifications.service';
import { Follow } from '../entities/follow.entity';
import { FollowMessages } from '../enums/follow-messages';

@Injectable()
export class FollowedNotificationInterceptor implements NestInterceptor {
  constructor(
    private readonly followNotificationsService: FollowNotificationsService,
    private readonly notificationsGatewayService: NotificationsGatewayService,
  ) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<Promise<{ data: Follow; message: FollowMessages }>> {
    return next.handle().pipe(
      map(async (follow: { data: Follow }) => {
        const notification =
          await this.followNotificationsService.createFollowedNotification({
            notifableID: follow.data.followed.id,
            senderID: follow.data.follower.id,
          });

        await this.notificationsGatewayService.sendNotification(
          notification.id,
        );

        return { data: follow.data, message: FollowMessages.FOLLOWED };
      }),
    );
  }
}
