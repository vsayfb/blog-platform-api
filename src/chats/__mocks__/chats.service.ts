import { chatStub } from '../stub/chat-stub';

export const ChatsService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(chatStub()),
  getAccountChats: jest.fn().mockResolvedValue([chatStub()]),
  getOne: jest.fn().mockResolvedValue(chatStub()),
  getOneByID: jest.fn().mockResolvedValue(chatStub()),
  getAll: jest.fn().mockResolvedValue([chatStub()]),
});
