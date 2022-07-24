import { notificationStub } from '../stub/notification-stub';

export const NotificationsService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(notificationStub()),
  delete: jest.fn().mockResolvedValue(notificationStub().id),
  update: jest.fn().mockResolvedValue(notificationStub().id),
  getAccountNotifications: jest.fn().mockResolvedValue([notificationStub()]),
  getOne: jest.fn().mockResolvedValue(notificationStub()),
  getOneByID: jest.fn().mockResolvedValue(notificationStub()),
  getAll: jest.fn().mockResolvedValue([notificationStub()]),
});
