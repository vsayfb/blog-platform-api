import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { GatewayEventsService } from 'src/global/events/gateway-events.service';
import { NotificationActions } from 'src/account_notifications/entities/notification.entity';
import { PostsNotificationService } from 'src/account_notifications/services/posts.notification.service';
import {
  PostExpression,
  PostExpressionType,
} from 'src/posts/entities/post-expression.entity';
import { ExpressionMessages } from '../enums/expression-messages';

@Injectable()
export class PostExpressionNotificationInterceptor implements NestInterceptor {
  constructor(
    private readonly gatewayEventsService: GatewayEventsService,
    private readonly postsNotificationService: PostsNotificationService,
  ) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<
    Promise<{ data: PostExpression; message: ExpressionMessages }>
  > {
    return next.handle().pipe(
      map(
        async (value: {
          data: PostExpression;
          message: ExpressionMessages;
        }) => {
          const { expression, account, post } = value.data;

          const action =
            expression === PostExpressionType.LIKE
              ? NotificationActions.LIKED_POST
              : NotificationActions.DISLIKED_POST;

          const notification =
            await this.postsNotificationService.createExpressionNotification({
              notifableID: post.author.id,
              senderID: account.id,
              postID: post.id,
              action,
            });

          this.gatewayEventsService.newNotification(notification.id);

          return value;
        },
      ),
    );
  }
}
