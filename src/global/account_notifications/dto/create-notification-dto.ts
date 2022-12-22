import { NotificationActions } from '../entities/notification.entity';

export type CreateNotificationDto = {
  senderID: string;
  notifableID: string;
  action: NotificationActions;
};
