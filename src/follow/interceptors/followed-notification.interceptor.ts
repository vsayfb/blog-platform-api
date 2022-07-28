import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { FollowNotificationsService } from 'src/notifications/services/follow-notifications.service';
import { Follow } from '../entities/follow.entity';
import { FollowMessages } from '../enums/follow-messages';

@Injectable()
export class FollowedNotificationInterceptor implements NestInterceptor {
  constructor(
    private readonly followNotificationsService: FollowNotificationsService,
  ) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<Promise<{ data: Follow; message: FollowMessages }>> {
    return next.handle().pipe(
      map(async (follow: { data: Follow }) => {
        await this.followNotificationsService.createFollowedNotification({
          notifableID: follow.data.followed.id,
          senderID: follow.data.follower.id,
        });

        return { data: follow.data, message: FollowMessages.FOLLOWED };
      }),
    );
  }
}
