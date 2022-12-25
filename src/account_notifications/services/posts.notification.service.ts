import { Injectable } from '@nestjs/common';
import {
  NotificationActions,
  NotificationObject,
} from '../entities/notification.entity';
import { NotificationsService } from './notifications.service';

@Injectable()
export class PostsNotificationService extends NotificationsService {
  async createExpressionNotification({
    senderID,
    notifableID,
    postID,
    action,
  }: {
    senderID: string;
    notifableID: string;
    postID: string;
    action: NotificationActions;
  }): Promise<{ id: string }> {
    const { id } = await this.notificationsRepository.save({
      notifable: { id: notifableID },
      sender: { id: senderID },
      post: { id: postID },
      object: NotificationObject.POST,
      action,
    });

    return { id };
  }
}
