import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { PasswordManagerService } from 'src/accounts/services/password-manager.service';
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

    if (!body.username || !body.password || !body.verification_code) {
      return false;
    }

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
      via === 'email' ? 'login_tfa_email' : 'login_tfa_mobile_phone';

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
