import { Injectable } from '@nestjs/common';
import { NotificationActions } from '../enums/notification-actions';
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
  }) {
    await this.notificationsRepository.save({
      sender: { id: senderID },
      notifable: { id: notifableID },
      comment: { id: commentID },
      post: { id: postID },
      action: NotificationActions.Commented,
    });
  }
}
