import { Chat } from '../entities/chat.entity';
import { accountStub } from '../../accounts/test/stub/account.stub';
import { Account } from '../../accounts/entities/account.entity';

export const chatStub = (): Chat => ({
  id: '6b1dfb4d-3g7d-3fad-9bdd-2b0d7b3dcb6d',
  members: [accountStub()] as Account[],
  messages: [],
  created_at: '2022-08-18T12:55:25.513Z' as unknown as Date,
  updated_at: '2022-07-18T12:55:25.513Z' as unknown as Date,
});
