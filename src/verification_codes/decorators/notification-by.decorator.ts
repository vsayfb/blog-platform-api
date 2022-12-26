import { SetMetadata } from '@nestjs/common';
import { NotificationBy } from 'src/notifications/types/notification-by';

export const NotificationTo = (by: NotificationBy) =>
  SetMetadata('notificationBy', by);
