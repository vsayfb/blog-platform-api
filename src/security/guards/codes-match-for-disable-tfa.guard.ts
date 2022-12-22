import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { JwtPayload } from 'src/lib/jwt.payload';
import { TwoFactorAuthService } from '../services/two-factor-auth.service';
import { TFAProcess } from '../types/tfa-process';

@Injectable()
export class CodesMatchForDisableTFA implements CanActivate {
  constructor(
    private readonly codesService: CodesService,
    private readonly accountsService: AccountsService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: { user: JwtPayload; body: { verification_code: string } } =
      context.switchToHttp().getRequest();

    if (request.body.verification_code?.length !== 6)
      throw new ForbiddenException(CodeMessages.INVALID_CODE);

    const { via } = await this.twoFactorAuthService.getOneByAccountID(
      request.user.sub,
    );

    const account = await this.accountsService.getCredentials(request.user.sub);

    const process: TFAProcess =
      via === 'email' ? 'disable_tfa_email' : 'disable_tfa_mobile_phone';

    const code = await this.codesService.getCodeByCredentials(
      request.body.verification_code,
      account[via],
      process,
    );

    if (!code) throw new ForbiddenException(CodeMessages.INVALID_CODE);

    return true;
  }
}
