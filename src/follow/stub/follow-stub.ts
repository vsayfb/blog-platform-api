import { accountStub } from 'src/accounts/test/stub/account.stub';
import { Follow } from '../entities/follow.entity';

export const followStub = (): Follow => ({
  id: '9b1deb4d-3b7d-4bad-9bcc-2b0d7b3dcf6r',
  followed: accountStub(),
  follower: { ...accountStub(), username: 'follower' },
  createdAt: undefined,
});
