import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { CodeMessages } from 'src/global/verification_codes/enums/code-messages';
import { VerificationCodesService } from 'src/global/verification_codes/verification-codes.service';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';

@Injectable()
export class CodeSentForEnableMobileTFA implements CanActivate {
  constructor(private readonly codesService: VerificationCodesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      user: JwtPayload;
      account_credentials: AccountWithCredentials;
    } = context.switchToHttp().getRequest();

    if (!req.account_credentials.mobile_phone)
      throw new ForbiddenException(AccountMessages.HAS_NOT_PHONE);

    const code = await this.codesService.getOneByReceiverAndProcess(
      req.account_credentials.mobile_phone,
      'enable_tfa_mobile_phone',
    );

    if (code) throw new ForbiddenException(CodeMessages.ALREADY_SENT);

    return true;
  }
}
