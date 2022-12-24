import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { VerificationCodesService } from 'src/global/verification_codes/verification-codes.service';
import { CodeMessages } from 'src/global/verification_codes/enums/code-messages';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';

@Injectable()
export class CodeSentForEnableEmailTFA implements CanActivate {
  constructor(private readonly codesService: VerificationCodesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      user: JwtPayload;
      account_credentials: AccountWithCredentials;
    } = context.switchToHttp().getRequest();

    if (!req.account_credentials.email)
      throw new ForbiddenException(AccountMessages.HAS_NOT_EMAIL);

    const code = await this.codesService.getOneByReceiverAndProcess(
      req.account_credentials.email,
      'enable_tfa_email',
    );

    if (code) throw new ForbiddenException(CodeMessages.ALREADY_SENT);

    return true;
  }
}
