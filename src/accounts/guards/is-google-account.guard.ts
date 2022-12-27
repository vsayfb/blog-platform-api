import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtPayload } from 'src/lib/jwt.payload';
import { RegisterType } from '../entities/account.entity';
import { AccountMessages } from '../enums/account-messages';
import { GoogleAccountsService } from '../services/google-accounts.service';
import { AccountWithCredentials } from '../types/account-with-credentials';

@Injectable()
export class IsGoogleAccount implements CanActivate {
  constructor(private readonly googleAccountsService: GoogleAccountsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      user: JwtPayload;
      account_credentials: AccountWithCredentials;
    } = context.switchToHttp().getRequest();

    const account = await this.googleAccountsService.getOneByID(req.user.sub);

    if (!account) throw new ForbiddenException(AccountMessages.NOT_FOUND);

    return true;
  }
}
