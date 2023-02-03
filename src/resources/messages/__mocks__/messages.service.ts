import { chatStub } from '../../chats/stub/chat-stub';
import { messageStub } from '../stub/message-stub';
import { accountStub } from '../../accounts/test/stub/account.stub';

export const MessagesService = jest.fn().mockReturnValue({
  create: jest.fn().mockReturnValue({
    chatID: chatStub().id,
    content: messageStub().content,
    sender: accountStub(),
    created_at: messageStub().created_at,
    updated_at: messageStub().updated_at,
  }),
  getAccountMessages: jest.fn().mockReturnValue([messageStub()]),
});
