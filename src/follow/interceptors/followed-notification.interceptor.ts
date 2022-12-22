import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { GatewayEventsService } from 'src/global/events/gateway-events.service';
import { FollowNotificationsService } from 'src/global/account_notifications/services/follow-notifications.service';
import { Follow } from '../entities/follow.entity';
import { FollowMessages } from '../enums/follow-messages';

@Injectable()
export class FollowedNotificationInterceptor implements NestInterceptor {
  constructor(
    private readonly followNotificationsService: FollowNotificationsService,
    private readonly gatewayEventsService: GatewayEventsService,
  ) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<Promise<{ data: Follow; message: FollowMessages }>> {
    return next.handle().pipe(
      map(async (follow: { data: Follow }) => {
        const { followed, follower } = follow.data;

        const notification =
          await this.followNotificationsService.createFollowedNotification({
            notifableID: followed.id,
            senderID: follower.id,
          });

        this.gatewayEventsService.newNotification(notification.id);

        return { data: follow.data, message: FollowMessages.FOLLOWED };
      }),
    );
  }
}
