import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { VerificationCode } from 'src/verification_codes/entities/code.entity';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { TFAMessages } from '../enums/tfa-messages';
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
  }): Promise<VerificationCode> {
    const account = await this.accountsService.getCredentials(accountID);

    if (account.two_factor_auth)
      throw new ForbiddenException(TFAMessages.ALREADY_ENABLED);

    if (!account[by]) {
      throw new ForbiddenException(
        by === 'email'
          ? AccountMessages.HAS_NOT_EMAIL
          : AccountMessages.HAS_NOT_PHONE,
      );
    }

    const notificationFactory = this.notificationFactory.createNotification(by);

    const process: TFAProcess =
      by === 'email' ? 'enable_tfa_email' : 'enable_tfa_mobile_phone';

    return await notificationFactory.notifyForTFA(account[by], process);
  }

  async disable(accountID: string): Promise<VerificationCode> {
    const tfa = await this.twoFactorAuthService.getOneByAccountID(accountID);

    if (!tfa) throw new ForbiddenException(TFAMessages.NOT_ENABLED);

    const account = await this.accountsService.getCredentials(accountID);

    const notificationFactory = this.notificationFactory.createNotification(
      tfa.via,
    );

    const process: TFAProcess =
      tfa.via === 'email' ? 'disable_tfa_email' : 'disable_tfa_mobile_phone';

    return await notificationFactory.notifyForTFA(account[tfa.via], process);
  }
}
