import { chatStub } from '../../chats/stub/chat-stub';
import { messageStub } from '../stub/message-stub';
import { accountStub } from '../../accounts/test/stub/account.stub';

export const MessagesService = jest.fn().mockReturnValue({
  create: jest.fn().mockReturnValue({
    chatID: chatStub().id,
    content: messageStub().content,
    sender: accountStub(),
    createdAt: messageStub().createdAt,
    updatedAt: messageStub().updatedAt,
  }),
  getAccountMessages: jest.fn().mockReturnValue([messageStub()]),
});
