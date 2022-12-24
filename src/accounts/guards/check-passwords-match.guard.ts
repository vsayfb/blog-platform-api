import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { PasswordManagerService } from 'src/accounts/services/password-manager.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountMessages } from '../enums/account-messages';
import { AccountWithCredentials } from '../types/account-with-credentials';

/**
 * This guard checks that given password matches with database password.
 * It they are matched puts the account into the request.account.
 */
@Injectable()
export class PasswordsMatch implements CanActivate {
  constructor(
    private readonly passwordManagerService: PasswordManagerService,
    private readonly accountsService: AccountsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: {
      user: JwtPayload;
      account_credentials?: AccountWithCredentials;
      body: { password: string };
    } = context.switchToHttp().getRequest();

    const client = request.user;

    const account = await this.accountsService.getCredentials(client.sub);

    const matched = await this.passwordManagerService.comparePassword(
      request.body.password,
      account.password,
    );

    if (!matched) throw new ForbiddenException(AccountMessages.WRONG_PASSWORD);

    request.account_credentials = account;

    return true;
  }
}
