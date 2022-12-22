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

/**
 * Use this guard after JwtAuthGuard
 */
@Injectable()
export class CodesMatchForCreateMobileTFA implements CanActivate {
  constructor(
    private readonly codesService: CodesService,
    private readonly accountsService: AccountsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: { user: JwtPayload; body: { verification_code: string } } =
      context.switchToHttp().getRequest();

    if (request.body.verification_code?.length !== 6)
      throw new ForbiddenException(CodeMessages.INVALID_CODE);

    const { mobile_phone } = await this.accountsService.getCredentials(
      request.user.sub,
    );

    const code = await this.codesService.getCodeByCredentials(
      request.body.verification_code,
      mobile_phone,
      'enable_tfa_mobile_phone',
    );

    if (!code) throw new ForbiddenException(CodeMessages.INVALID_CODE);

    return true;
  }
}
