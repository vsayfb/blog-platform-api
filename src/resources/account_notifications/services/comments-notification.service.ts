import { Injectable } from '@nestjs/common';
import {
  NotificationActions,
  NotificationObject,
} from '../entities/account-notification.entity';
import { NotificationsService } from './notifications.service';

@Injectable()
export class CommentsNotificationService extends NotificationsService {
  async createCommentNotification({
    senderID,
    notifableID,
    commentID,
    postID,
  }: {
    senderID: string;
    notifableID: string;
    commentID: string;
    postID: string;
  }): Promise<{ id: string }> {
    const { id } = await this.notificationsRepository.save({
      sender: { id: senderID },
      notifable: { id: notifableID },
      comment: { id: commentID },
      post: { id: postID },
      object: NotificationObject.POST_COMMENT,
      action: NotificationActions.COMMENTED_POST,
    });

    return { id };
  }

  async createReplyNotification({
    senderID,
    notifableID,
    postID,
    commentID,
    replyID,
  }: {
    senderID: string;
    notifableID: string;
    commentID: string;
    postID: string;
    replyID: string;
  }): Promise<{ id: string }> {
    const { id } = await this.notificationsRepository.save({
      sender: { id: senderID },
      notifable: { id: notifableID },
      comment: { id: commentID },
      reply: { id: replyID },
      post: { id: postID },
      object: NotificationObject.COMMENT_REPLY,
      action: NotificationActions.REPLIED_COMMENT,
    });

    return { id };
  }

  async createCommentExpressionNotification({
    senderID,
    notifableID,
    commentID,
    postID,
    action,
  }: {
    senderID: string;
    notifableID: string;
    commentID: string;
    postID: string;
    action: NotificationActions;
  }): Promise<{ id: string }> {
    const { id } = await this.notificationsRepository.save({
      sender: { id: senderID },
      notifable: { id: notifableID },
      comment: { id: commentID },
      post: { id: postID },
      object: NotificationObject.POST_COMMENT,
      action,
    });

    return { id };
  }
}
