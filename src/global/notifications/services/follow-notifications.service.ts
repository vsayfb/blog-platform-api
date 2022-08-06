import { Injectable } from '@nestjs/common';
import { CreateFollowedNotificationDto } from '../dto/create-followed-notification.dto';
import { NotificationActions } from '../enums/notification-actions';
import { NotificationsService } from './notifications.service';

@Injectable()
export class FollowNotificationsService extends NotificationsService {
  async createFollowedNotification({
    senderID,
    notifableID,
  }: CreateFollowedNotificationDto): Promise<{ id: string }> {
    const { id } = await this.notificationsRepository.save({
      sender: { id: senderID },
      notifable: { id: notifableID },
      action: NotificationActions.Followed,
    });

    return { id };
  }
}
