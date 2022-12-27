import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountMessages } from '../enums/account-messages';
import { LocalAccountsService } from '../services/local-accounts.service';
import { AccountWithCredentials } from '../types/account-with-credentials';

@Injectable()
export class IsLocalAccount implements CanActivate {
  constructor(private readonly localAccountsService: LocalAccountsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      user: JwtPayload;
      account_credentials: AccountWithCredentials;
    } = context.switchToHttp().getRequest();

    const account = await this.localAccountsService.getOneByID(req.user.sub);

    if (!account) throw new ForbiddenException(AccountMessages.NOT_FOUND);

    return true;
  }
}
