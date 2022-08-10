import { Message } from '../entities/message.entity';
import { accountStub } from '../../accounts/test/stub/account.stub';
import { Account } from '../../accounts/entities/account.entity';
import { chatStub } from '../../chats/stub/chat-stub';
import { Chat } from '../../chats/entities/chat.entity';

export const messageStub = (): Message => ({
  id: '6b1d222d-2g7d-3fad-9bdd-2b0d7b3dcb6d',
  sender: accountStub() as Account,
  content: 'foo-message-content',
  seen: false,
  chat: chatStub() as Chat,
  createdAt: '2022-08-18T12:55:25.513Z' as unknown as Date,
  updatedAt: '2022-08-18T12:55:25.513Z' as unknown as Date,
});
