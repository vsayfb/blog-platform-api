import { Follow } from '../entities/follow.entity';
import { accountDummy } from '../../accounts/dummy/accountDummy';
import { Account } from '../../accounts/entities/account.entity';

export const followDummy = (): Follow => ({
  followed: accountDummy() as Account,
  follower: accountDummy() as Account,
  id: 'uuid',
  subscriptions: { mails_turned_on: false, notifications_turned_on: false },
  created_at: new Date(),
});
