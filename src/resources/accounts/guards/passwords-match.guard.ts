import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountMessages } from '../enums/account-messages';
import { AccountsService } from '../services/accounts.service';
import { PasswordManagerService } from '../services/password-manager.service';
import { AccountWithCredentials } from '../types/account-with-credentials';

/**
 * Validate "password" value in req.body before using this guard.
 *
 * This guard checks that given password matches with hashed password.
 *
 * It they are matched, you can get account with @AccountCredentials decorator.
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
