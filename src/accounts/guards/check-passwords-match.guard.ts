import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { PasswordManagerService } from 'src/accounts/services/password-manager.service';
import { JwtPayload } from 'src/lib/jwt.payload';

@Injectable()
export class CheckPasswordsMatch implements CanActivate {
  constructor(
    private readonly passwordManagerService: PasswordManagerService,
    private readonly accountsService: AccountsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: { user: JwtPayload; body: { password?: string } } = context
      .switchToHttp()
      .getRequest();

    const client = request.user;

    const account = await this.accountsService.getWithCredentials(client.sub);

    return await this.passwordManagerService.comparePassword(
      request.body?.password,
      account.password,
    );
  }
}
