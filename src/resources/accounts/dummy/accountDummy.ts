import {
  RegisterType,
  Role,
} from 'src/resources/accounts/entities/account.entity';
import { AccountWithCredentials } from '../types/account-with-credentials';
import { NotificationBy } from 'src/notifications/types/notification-by';

export const accountDummy = (): AccountWithCredentials => ({
  id: '9b1deb4d-3b7d',
  display_name: 'foo_display_name',
  email: 'foo@gmail.com',
  mobile_phone: '5555554',
  password: 'foo_password',
  username: 'foo',
  via: RegisterType.LOCAL,
  two_factor_auth: {
    id: '1232deb-124mn',
    created_at: '' as unknown as Date,
    updated_at: '' as unknown as Date,
    via: NotificationBy.EMAIL,
  },
  image: null,
  role: Role.USER,
  created_at: '2022-07-18T12:55:25.513Z' as unknown as Date,
});
