import { notificationStub } from 'src/resources/account_notifications/stub/notification-stub';

export const GatewayEventsService = jest.fn().mockReturnValue({
  sendNotification: jest.fn().mockResolvedValue(notificationStub().id),
  newMessage: jest.fn().mockReturnValue(undefined),
});
