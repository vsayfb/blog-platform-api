import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {
  CommentExpression,
  CommentExpressionType,
} from 'src/comments/entities/comment-expression.entity';
import { GatewayEventsService } from 'src/global/events/gateway-events.service';
import { NotificationActions } from 'src/account_notifications/entities/notification.entity';
import { CommentsNotificationService } from 'src/account_notifications/services/comments-notification.service';
import { ExpressionMessages } from '../enums/expression-messages';

@Injectable()
export class CommentExpressionNotificationInterceptor
  implements NestInterceptor
{
  constructor(
    private readonly gatewayEventsService: GatewayEventsService,
    private readonly commentsNotificationService: CommentsNotificationService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<
    Promise<{ data: CommentExpression; message: ExpressionMessages }>
  > {
    return next.handle().pipe(
      map(
        async (value: {
          data: CommentExpression;
          message: ExpressionMessages;
        }) => {
          const { expression, account, comment } = value.data;

          const action =
            expression === CommentExpressionType.LIKE
              ? NotificationActions.LIKED_COMMENT
              : NotificationActions.DISLIKED_COMMENT;

          const notification =
            await this.commentsNotificationService.createCommentExpressionNotification(
              {
                notifableID: comment.author.id,
                senderID: account.id,
                postID: comment.post.id,
                commentID: comment.id,
                action,
              },
            );

          this.gatewayEventsService.newNotification(notification.id);

          return value;
        },
      ),
    );
  }
}
