import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { Notification } from '../entities/notification.entity';
import { NotificationActions } from '../enums/notification-actions';

export const notificationStub = (): Notification => ({
  id: '7b1deb4d-3b6d-4bad-9ccd-2b0d7b3dcb5d',
  action: NotificationActions.Followed,
  link: '/random_link',
  seen: false,
  notifable: accountStub() as Account,
  sender: accountStub() as Account,
  createdAt: '2022-07-18T12:55:25.513Z' as unknown as Date,
});
