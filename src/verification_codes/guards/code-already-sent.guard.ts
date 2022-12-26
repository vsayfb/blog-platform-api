import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';
import { Reflector } from '@nestjs/core';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { CodeProcess } from '../entities/code.entity';

/**
 * You have to use below decorators before this guard.
 *
 * NotificationTo()
 *
 * VerificationCodeProcess()
 */

@Injectable()
export class VerificationCodeAlreadySent implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly codesService: VerificationCodesService,
    private readonly accountsService: AccountsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      user: JwtPayload;
    } = context.switchToHttp().getRequest();

    const account = await this.accountsService.getCredentials(req.user.sub);

    const process = this.reflector.get<CodeProcess>(
      'process',
      context.getHandler(),
    );

    const notificationBy = this.reflector.get<NotificationBy>(
      'notificationBy',
      context.getHandler(),
    );

    const code = await this.codesService.getOneByReceiverAndProcess(
      account[notificationBy],
      process,
    );

    if (code) throw new ForbiddenException(CodeMessages.ALREADY_SENT);

    return true;
  }
}
