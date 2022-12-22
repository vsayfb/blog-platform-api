import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { JwtPayload } from 'src/lib/jwt.payload';
import { TFAVia } from '../entities/two-factor-auth.entity';
import { TwoFactorAuthService } from '../services/two-factor-auth.service';
import { TFAProcess } from '../types/tfa-process';

@Injectable()
export class CodeSentForDisableTFA implements CanActivate {
  constructor(
    private readonly codesService: CodesService,
    private readonly accountsService: AccountsService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: { user: JwtPayload; body: { verification_code: string } } =
      context.switchToHttp().getRequest();

    const { via } = await this.twoFactorAuthService.getOneByAccountID(
      request.user.sub,
    );

    const account = await this.accountsService.getCredentials(request.user.sub);

    const process: TFAProcess =
      via === 'email' ? 'disable_tfa_email' : 'disable_tfa_mobile_phone';

    const code = await this.codesService.getOneByReceiverAndType(
      account[via],
      process,
    );

    if (code) throw new ForbiddenException(CodeMessages.ALREADY_SENT);

    return true;
  }
}
