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

@Injectable()
export class PasswordsMatch implements CanActivate {
  constructor(
    private readonly passwordManagerService: PasswordManagerService,
    private readonly accountsService: AccountsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: { user: JwtPayload; body: { password?: string } } = context
      .switchToHttp()
      .getRequest();

    const client = request.user;

    const account = await this.accountsService.getCredentials(client.sub);

    if (
      request.body.password?.length >= 7 &&
      request.body.password?.length <= 16
    ) {
      const matches = await this.passwordManagerService.comparePassword(
        request.body.password,
        account.password,
      );

      if (matches) return true;
    }

    throw new ForbiddenException(AccountMessages.WRONG_PASSWORD);
  }
}
