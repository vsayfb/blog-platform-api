import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { PasswordManagerService } from 'src/accounts/services/password-manager.service';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { CodeProcess } from 'src/verification_codes/entities/code.entity';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';

@Injectable()
export class TFAGuard implements CanActivate {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly passwordService: PasswordManagerService,
    private readonly codesService: VerificationCodesService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const { body } = request;

    const account =
      await this.accountsService.getCredentialsByUsernameOrEmailOrPhone(
        body.username,
      );

    if (!account) return false;

    const matched = await this.passwordService.comparePassword(
      body.password,
      account.password,
    );

    if (!matched) return false;

    const { via } = account.two_factor_auth;

    const process: CodeProcess =
      via === NotificationBy.EMAIL
        ? CodeProcess.LOGIN_TFA_EMAIL_FOR_ACCOUNT
        : CodeProcess.LOGIN_TFA_MOBILE_PHONE_FOR_ACCOUNT;

    const code = await this.codesService.getCodeByCredentials(
      body.verification_code,
      account[via],
      process,
    );

    if (!code) return false;

    request.tfa_account = account;

    return true;
  }
}
