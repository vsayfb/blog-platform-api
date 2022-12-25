import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import {
  Notification,
  NotificationActions,
  NotificationObject,
} from '../entities/notification.entity';

export const notificationStub = (): Notification => ({
  id: '7b1deb4d-3b6d-4bad-9ccd-2b0d7b3dcb5d',
  action: NotificationActions.FOLLOWED,
  seen: false,
  notifable: accountStub() as Account,
  sender: accountStub() as Account,
  created_at: '2022-07-18T12:55:25.513Z' as unknown as Date,
  updated_at: '2022-07-18T12:55:25.513Z' as unknown as Date,
  object: NotificationObject.FOLLOW,
});
