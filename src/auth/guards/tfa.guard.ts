import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';

/**
 * Validate verification_code in body and token in params before using this guard.
 *
 * If verication code matches in database code this guard puts account.credentials at req.account_credentials
 *
 * You can get it with @AccountCredentials decorator.
 */

@Injectable()
export class TFAGuard implements CanActivate {
  constructor(
    private readonly codesService: VerificationCodesService,
    private readonly accountsService: AccountsService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req: {
      body: { verification_code: string };
      params: { token: string };
      account_credentials: AccountWithCredentials;
    } = context.switchToHttp().getRequest();

    const code = await this.codesService.getOneByCodeAndToken(
      req.body.verification_code,
      req.params.token,
    );

    if (!code) return false;

    const account =
      await this.accountsService.getCredentialsByUsernameOrEmailOrPhone(
        code.receiver,
      );

    req.account_credentials = account;

    return true;
  }
}
