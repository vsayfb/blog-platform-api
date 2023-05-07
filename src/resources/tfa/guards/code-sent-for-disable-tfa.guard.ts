import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AccountWithCredentials } from 'src/resources/accounts/types/account-with-credentials';
import { CodeMessages } from 'src/resources/verification_codes/enums/code-messages';
import { VerificationCodesService } from 'src/resources/verification_codes/verification-codes.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CodeProcess } from 'src/resources/verification_codes/entities/code.entity';
import { TFAMessages } from '../enums/tfa-messages';
import { Reflector } from '@nestjs/core';
import { NotificationBy } from 'src/notifications/types/notification-by';

@Injectable()
export class CodeAlreadySentForDisableTFA implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly codesService: VerificationCodesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      user: JwtPayload;
      account_credentials: AccountWithCredentials;
    } = context.switchToHttp().getRequest();

    const tfa = req.account_credentials.two_factor_auth;

    if (!tfa) throw new ForbiddenException(TFAMessages.NOT_ENABLED);

    const followingLink = this.reflector.get(
      'followingLink',
      context.getHandler(),
    );

    const process: CodeProcess =
      tfa.via === 'email'
        ? CodeProcess.DISABLE_TFA_EMAIL_FACTOR
        : CodeProcess.DISABLE_TFA_MOBILE_PHONE_FACTOR;

    const code = await this.codesService.getOneByReceiverAndProcess(
      req.account_credentials[tfa.via],
      process,
    );

    if (code) {
      const via = tfa.via === NotificationBy.EMAIL ? 'email' : 'mobile phone.';

      throw new ForbiddenException({
        following_url: followingLink,
        message: CodeMessages.ALREADY_SENT.slice(0, -1) + ' ' + via,
      });
    }

    return true;
  }
}
