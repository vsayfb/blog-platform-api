import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccountMessages } from 'src/resources/accounts/enums/account-messages';
import { AccountsService } from 'src/resources/accounts/services/accounts.service';
import {
  CodeProcess,
  VerificationCode,
} from 'src/resources/verification_codes/entities/code.entity';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { TFAMessages } from '../enums/tfa-messages';
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
    const account = await this.accountsService.getCredentialsByID(accountID);

    if (account.two_factor_auth)
      throw new ForbiddenException(TFAMessages.ALREADY_ENABLED);

    if (!account[by]) {
      throw new ForbiddenException(
        by === 'email'
          ? AccountMessages.HAS_NOT_EMAIL
          : AccountMessages.HAS_NOT_MOBILE_PHONE,
      );
    }

    const notificationFactory = this.notificationFactory.createNotification(by);

    const process: CodeProcess =
      by === 'email'
        ? CodeProcess.ENABLE_TFA_EMAIL_FACTOR
        : CodeProcess.ENABLE_TFA_MOBILE_PHONE_FACTOR;

    return await notificationFactory.notifyForTFA(account[by], process);
  }

  async disable(accountID: string): Promise<VerificationCode> {
    const tfa = await this.twoFactorAuthService.getOneByAccountID(accountID);

    if (!tfa) throw new ForbiddenException(TFAMessages.NOT_ENABLED);

    const account = await this.accountsService.getCredentialsByID(accountID);

    const notificationFactory = this.notificationFactory.createNotification(
      tfa.via,
    );

    const process: CodeProcess =
      tfa.via === 'email'
        ? CodeProcess.DISABLE_TFA_EMAIL_FACTOR
        : CodeProcess.DISABLE_TFA_MOBILE_PHONE_FACTOR;

    return await notificationFactory.notifyForTFA(account[tfa.via], process);
  }
}
