import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from 'src/accounts/request-dto/create-account.dto';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { IAuthService } from '../interfaces/auth-service.interface';
import { BaseAuthService } from './base-auth.service';
import { RegisterDto } from '../response-dto/register.dto';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { CodeProcess } from 'src/verification_codes/entities/code.entity';
import { LocalAccountsService } from 'src/accounts/services/local-accounts.service';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { EnabledEmailFactorException } from 'src/tfa/exceptions/enabled-email-factor.exception';
import { EnabledMobilePhoneFactorException } from 'src/tfa/exceptions/enabled-mobile-phone-factor.exception';

@Injectable()
export class LocalAuthService extends BaseAuthService implements IAuthService {
  constructor(
    private readonly localAccountsService: LocalAccountsService,
    private readonly codesService: VerificationCodesService,
  ) {
    super();
  }

  async register(
    dto: CreateAccountDto & { email?: string; mobile_phone?: string },
  ): Promise<RegisterDto> {
    const registerBy = dto?.email ? 'email' : 'mobile_phone';

    const process: CodeProcess =
      registerBy === 'email'
        ? CodeProcess.REGISTER_WITH_EMAIL
        : CodeProcess.REGISTER_WITH_MOBIL_PHONE;

    const receiver = registerBy === 'email' ? dto.email : dto.mobile_phone;

    const code = await this.codesService.getCodeByCredentials(
      dto.verification_code,
      receiver,
      process,
    );

    if (!code) throw new ForbiddenException(CodeMessages.INVALID_CODE);

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
