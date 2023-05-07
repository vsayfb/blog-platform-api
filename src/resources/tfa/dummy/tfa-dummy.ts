import { TwoFactorAuth } from '../entities/two-factor-auth.entity';
import { accountDummy } from '../../accounts/dummy/accountDummy';
import { NotificationBy } from '../../../notifications/types/notification-by';
import { Account } from '../../accounts/entities/account.entity';

export const tfaDummy = (): TwoFactorAuth => ({
  id: 'some-id',
  account: accountDummy() as Account,
  via: NotificationBy.EMAIL,
  created_at: new Date(),
  updated_at: new Date(),
});
