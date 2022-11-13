import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { GatewayEventsService } from 'src/global/events/gateway-events.service';
import { CommentsNotificationService } from 'src/global/notifications/services/comments-notification.service';
import { CommentViewDto } from '../dto/comment-view.dto';
import { CreatedCommentDto } from '../dto/created-comment.dto';
import { CommentMessages } from '../enums/comment-messages';

@Injectable()
export class CommentedNotificationInterceptor implements NestInterceptor {
  constructor(
    private readonly commentsNotificationService: CommentsNotificationService,
    private readonly gatewayEventsService: GatewayEventsService,
  ) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<Promise<{ data: CommentViewDto; message: CommentMessages }>> {
    return next.handle().pipe(
      map(async (comment: { data: CreatedCommentDto }) => {
        const {
          id,
          content,
          created_at,
          updated_at,
          author: commentAuthor,
          post,
        } = comment.data;

        const senderID = commentAuthor.id;
        const notifableID = post.author.id;

        if (senderID !== notifableID) {
          const notification =
            await this.commentsNotificationService.createCommentNotification({
              commentID: id,
              senderID,
              notifableID,
              postID: post.id,
            });

          this.gatewayEventsService.newNotification(notification.id);
        }

        return {
          data: { id, content, created_at, updated_at, author: commentAuthor },
          message: CommentMessages.CREATED,
        };
      }),
    );
  }
}
