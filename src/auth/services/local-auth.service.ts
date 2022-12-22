import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { IAuthService } from '../interfaces/auth-service.interface';
import { BaseAuthService } from './base-auth.service';
import { RegisterViewDto } from '../dto/register-view.dto';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { RegisterProcess } from '../types/register-process';
import { TFAEnabledException } from 'src/security/exceptions/tfa-enable.exception';

@Injectable()
export class LocalAuthService extends BaseAuthService implements IAuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly codesService: CodesService,
  ) {
    super();
  }

  async register(
    dto: CreateAccountDto & { email?: string; mobile_phone?: string },
  ): Promise<RegisterViewDto> {
    const registerBy = dto?.email ? 'email' : 'mobile_phone';

    const process: RegisterProcess =
      registerBy === 'email' ? 'register_email' : 'register_mobile_phone';

    const receiver = registerBy === 'email' ? dto.email : dto.mobile_phone;

    const code = await this.codesService.getCodeByCredentials(
      dto.verification_code,
      receiver,
      process,
    );

    if (!code) throw new ForbiddenException(CodeMessages.INVALID_CODE);

    const account = await this.accountsService.create(dto);

    return this.login(account);
  }

  async validateAccount(
    username: string,
    pass: string,
  ): Promise<SelectedAccountFields> | null {
    const account =
      await this.accountsService.getCredentialsByUsernameOrEmailOrPhone(
        username,
      );

    const passwordsMatch = account
      ? await this.passwordManagerService.comparePassword(
          pass,
          account.password,
        )
      : false;

    if (passwordsMatch) {
      if (account.two_factor_auth) throw new TFAEnabledException(account);

      return account;
    }

    return null;
  }
}
