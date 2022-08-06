import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { GatewayEventsService } from 'src/global/events/gateway-events.service';
import { CommentsNotificationService } from 'src/global/notifications/services/comments-notification.service';
import { CreatedCommentDto } from '../dto/created-comment.dto';
import { CommentMessages } from '../enums/comment-messages';
import { SelectedCommentFields } from '../types/selected-comment-fields';

@Injectable()
export class CommentedNotificationInterceptor implements NestInterceptor {
  constructor(
    private readonly commentsNotificationService: CommentsNotificationService,
    private readonly gatewayEventsService: GatewayEventsService,
  ) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<
    Promise<{ data: SelectedCommentFields; message: CommentMessages }>
  > {
    return next.handle().pipe(
      map(async (comment: { data: CreatedCommentDto }) => {
        const { id, content, created_at, updated_at, author, post } =
          comment.data;

        const notification =
          await this.commentsNotificationService.createCommentNotification({
            commentID: id,
            senderID: author.id,
            notifableID: post.author.id,
            postID: post.id,
          });

        await this.gatewayEventsService.newNotification(notification.id);

        return {
          data: { id, content, created_at, updated_at },
          message: CommentMessages.CREATED,
        };
      }),
    );
  }
}
