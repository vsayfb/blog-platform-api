import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { VerificationBy } from 'src/verifications/types/verification-by';
import { CodesService } from '../codes.service';
import { CodeVerificationProcess } from '../entities/code.entity';
import { CodeMessages } from '../enums/code-messages';

/**
 * Use this class if the client has a token.
 * @constructor
 */
@Injectable()
export class CheckCodeSent implements CanActivate {
  @Inject(AccountsService)
  private readonly accountsService: AccountsService;

  @Inject(CodesService)
  private readonly codesService: CodesService;

  constructor(
    private readonly verificationBy: VerificationBy,
    private readonly process: 'TFA_EMAIL' | 'TFA_SMS',
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: { body: { code?: string }; user: JwtPayload } = context
      .switchToHttp()
      .getRequest();

    const account = await this.accountsService.getCredentials(request.user.sub);

    let codeSent = false;

    if (this.verificationBy === 'mail') {
      codeSent = !(await this.codesService.getOneByReceiverAndType(
        account.email,
        CodeVerificationProcess[this.process],
      ));
    } else {
      codeSent = !(await this.codesService.getOneByReceiverAndType(
        account.mobile_phone,
        CodeVerificationProcess[this.process],
      ));
    }

    if (codeSent) throw new ForbiddenException(CodeMessages.ALREADY_SENT);

    return true;
  }
}
