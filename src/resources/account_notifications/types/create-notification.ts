import { NotificationActions } from '../entities/notification.entity';

export type CreateNotification = {
  senderID: string;
  notifableID: string;
  action: NotificationActions;
};
