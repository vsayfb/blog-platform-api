import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';
import { CodeMessages } from 'src/global/verification_codes/enums/code-messages';
import { VerificationCodesService } from 'src/global/verification_codes/verification-codes.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { TFAProcess } from '../types/tfa-process';

@Injectable()
export class CodeSentForDisableTFA implements CanActivate {
  constructor(private readonly codesService: VerificationCodesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      user: JwtPayload;
      account_credentials: AccountWithCredentials;
    } = context.switchToHttp().getRequest();

    const tfa = req.account_credentials.two_factor_auth;

    if (!tfa) return false;

    const process: TFAProcess =
      tfa.via === 'email' ? 'disable_tfa_email' : 'disable_tfa_mobile_phone';

    const code = await this.codesService.getOneByReceiverAndProcess(
      req.account_credentials[tfa.via],
      process,
    );

    if (code) throw new ForbiddenException(CodeMessages.ALREADY_SENT);

    return true;
  }
}
