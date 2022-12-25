import { Injectable } from '@nestjs/common';
import { CreateFollowedNotification } from '../types/create-followed-notification';
import {
  NotificationActions,
  NotificationObject,
} from '../entities/notification.entity';
import { NotificationsService } from './notifications.service';

@Injectable()
export class FollowNotificationsService extends NotificationsService {
  async createFollowedNotification({
    senderID,
    notifableID,
  }: CreateFollowedNotification): Promise<{ id: string }> {
    const { id } = await this.notificationsRepository.save({
      sender: { id: senderID },
      notifable: { id: notifableID },
      action: NotificationActions.FOLLOWED,
      object: NotificationObject.FOLLOW,
    });

    return { id };
  }
}
