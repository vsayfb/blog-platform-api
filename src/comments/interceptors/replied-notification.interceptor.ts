import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { GatewayEventsService } from 'src/global/events/gateway-events.service';
import { CommentsNotificationService } from 'src/account_notifications/services/comments-notification.service';
import { CommentMessages } from '../enums/comment-messages';
import { CreatedReplyDto } from '../response-dto/created-reply.dto';

@Injectable()
export class RepliedNotificationInterceptor implements NestInterceptor {
  constructor(
    private readonly commentsNotificationService: CommentsNotificationService,
    private readonly gatewayEventsService: GatewayEventsService,
  ) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<
    Promise<{
      data: CreatedReplyDto;
      message: CommentMessages;
    }>
  > {
    return next.handle().pipe(
      map(async (comment: { data: CreatedReplyDto }) => {
        const {
          id,
          content,
          created_at,
          updated_at,
          author: commentAuthor,
          parent,
          post,
        } = comment.data;

        const senderID = commentAuthor.id;
        const notifableID = parent.author.id;

        if (senderID !== notifableID) {
          const notification =
            await this.commentsNotificationService.createReplyNotification({
              commentID: parent.id,
              senderID,
              notifableID,
              postID: post.id,
              replyID: id,
            });

          this.gatewayEventsService.newNotification(notification.id);
        }

        return {
          data: {
            id,
            content,
            created_at,
            updated_at,
            post,
            parent,
            author: commentAuthor,
          },
          message: CommentMessages.REPLY_CREATED,
        };
      }),
    );
  }
}
