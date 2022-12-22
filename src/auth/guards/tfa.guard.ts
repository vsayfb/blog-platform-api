import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { PasswordManagerService } from 'src/accounts/services/password-manager.service';
import { CodesService } from 'src/codes/codes.service';
import { CodeProcess } from 'src/codes/entities/code.entity';

@Injectable()
export class TFAGuard implements CanActivate {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly passwordService: PasswordManagerService,
    private readonly codesService: CodesService,
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

    request.tfa_account_username = account.username;

    return true;
  }
}
