import { chatStub } from '../stub/chat-stub';

export const ChatsService = jest.fn().mockReturnValueOnce({
  create: jest.fn().mockResolvedValue(chatStub()),
  findAll: jest.fn().mockResolvedValue([chatStub()]),
  findOne: jest.fn().mockResolvedValue(chatStub()),
  delete: jest.fn().mockResolvedValue(chatStub().id),
});
