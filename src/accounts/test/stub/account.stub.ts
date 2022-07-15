import { RegisterType } from './../../entities/account.entity';
import { Account, Role } from 'src/accounts/entities/account.entity';

const stub: Account = {
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  email: 'foo@gmail.com',
  password: 'foo1234',
  display_name: 'foo_display_name',
  username: 'foo',
  image: null,
  role: Role.USER,
  posts: [],
  comments: [],
  bookmarks: [],
  followed: [] as any,
  followers: [] as any,
  via: RegisterType.LOCAL,
  createdAt: undefined,
  updatedAt: undefined,
};

export const accountStub = (): Account => ({
  ...stub,
});
