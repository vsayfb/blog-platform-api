import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';
import { AuthRoutes } from 'src/auth/enums/auth-routes';
import { VerificationCodesService } from 'src/global/verification_codes/verification-codes.service';
import { AUTH_ROUTE } from 'src/lib/constants';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { TFAProcess } from '../types/tfa-process';
import { TFAEnabledException } from './tfa-enable.exception';

@Catch(TFAEnabledException)
export class TFAEnabledExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly notificationFactory: NotificationFactory,
    private readonly codesService: VerificationCodesService,
  ) {}

  async catch(exception: TFAEnabledException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const account = exception.getResponse() as AccountWithCredentials;

    const receiver = account[account.two_factor_auth.via];

    const via = account.two_factor_auth.via;

    const process: TFAProcess =
      via === 'email' ? 'login_tfa_email' : 'login_tfa_mobile_phone';

    const alreadySent = await this.codesService.getOneByReceiverAndProcess(
      receiver,
      process,
    );

    if (alreadySent) {
      return response.status(403).json({
        statusCode: 403,
        error: 'Forbidden',
        message: `A code already sent to your ${
          via === 'email' ? via : 'mobil phone.'
        }`,
      });
    }

    await this.notificationFactory
      .createNotification(via)
      .notifyForTFA(account[via], process);

    return response.status(200).json({
      following_link: AUTH_ROUTE + AuthRoutes.VERIFY_LOGIN,
      message: `A code sent to your ${via === 'email' ? via : 'mobil phone.'}`,
    });
  }
}
