import { NotificationActions } from '../entities/account-notification.entity';

export type CreateNotification = {
  senderID: string;
  notifableID: string;
  action: NotificationActions;
};
