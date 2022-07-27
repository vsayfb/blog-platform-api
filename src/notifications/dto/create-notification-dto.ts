import { NotificationActions } from '../enums/notification-actions';

export type CreateNotificationDto = {
  senderID: string;
  notifableID: string;
  action: NotificationActions;
};
