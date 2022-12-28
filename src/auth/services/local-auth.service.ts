import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from 'src/accounts/request-dto/create-account.dto';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { IAuthService } from '../interfaces/auth-service.interface';
import { BaseAuthService } from './base-auth.service';
import { RegisterDto } from '../response-dto/register.dto';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';
import { LocalAccountsService } from 'src/accounts/services/local-accounts.service';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { EnabledEmailFactorException } from 'src/tfa/exceptions/enabled-email-factor.exception';
import { EnabledMobilePhoneFactorException } from 'src/tfa/exceptions/enabled-mobile-phone-factor.exception';
import { CreateLocalAccount } from '../types/create-local-account';

@Injectable()
export class LocalAuthService extends BaseAuthService implements IAuthService {
  constructor(private readonly localAccountsService: LocalAccountsService) {
    super();
  }

  async register(dto: CreateLocalAccount): Promise<RegisterDto> {
    const account = await this.localAccountsService.create(dto);

    return this.login(account);
  }

  async validateAccount(
    username: string,
    pass: string,
  ): Promise<SelectedAccountFields> | null {
    const account =
      await this.localAccountsService.getCredentialsByUsernameOrEmailOrPhone(
        username,
      );

    const passwordsMatch = account
      ? await this.passwordManagerService.comparePassword(
          pass,
          account.password,
        )
      : false;

    if (passwordsMatch) {
      if (account.two_factor_auth) {
        if (account.two_factor_auth.via === NotificationBy.EMAIL) {
          throw new EnabledEmailFactorException(account);
        } else {
          throw new EnabledMobilePhoneFactorException(account);
        }
      }

      delete account.mobile_phone;
      delete account.email;
      delete account.via;
      delete account.password;
      delete account.two_factor_auth;

      return account;
    }

    return null;
  }
}
