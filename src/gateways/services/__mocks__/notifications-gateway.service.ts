import { notificationStub } from 'src/notifications/stub/notification-stub';

export const NotificationsGatewayService = jest.fn().mockReturnValue({
  sendNotification: jest.fn().mockResolvedValue(notificationStub().id),
});
