import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { NotificationFactory } from 'src/notifications/services/verification-factory.service';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { TFAProcess } from '../types/tfa-process';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Injectable()
export class TwoFactorAuthManager {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly notificationFactory: NotificationFactory,
    private readonly accountsService: AccountsService,
  ) {}

  async enable({
    by,
    accountID,
  }: {
    by: NotificationBy;
    accountID: string;
  }): Promise<void> {
    const account = await this.accountsService.getCredentials(accountID);

    if (!account[by])
      throw new ForbiddenException('Account has not a saved ' + by + '.');

    const notificationFactory = this.notificationFactory.createNotification(by);

    const process: TFAProcess =
      by === 'email' ? 'enable_tfa_email' : 'enable_tfa_mobile_phone';

    await notificationFactory.notifyForTFA(account[by], process);
  }

  async disable(accountID: string): Promise<void> {
    const { via } = await this.twoFactorAuthService.getOneByAccountID(
      accountID,
    );

    const account = await this.accountsService.getCredentials(accountID);

    const notificationFactory =
      this.notificationFactory.createNotification(via);

    const process: TFAProcess =
      via === 'email' ? 'disable_tfa_email' : 'disable_tfa_mobile_phone';

    await notificationFactory.notifyForTFA(account[via], process);
  }
}
