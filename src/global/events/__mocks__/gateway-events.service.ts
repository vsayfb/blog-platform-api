import { notificationStub } from 'src/global/notifications/stub/notification-stub';

export const GatewayEventsService = jest.fn().mockReturnValue({
  sendNotification: jest.fn().mockResolvedValue(notificationStub().id),
  newMessage: jest.fn().mockReturnValue(undefined),
});
