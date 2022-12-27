import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';
import { AuthRoutes } from 'src/auth/enums/auth-routes';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';
import { AUTH_ROUTE } from 'src/lib/constants';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { CodeProcess } from 'src/verification_codes/entities/code.entity';
import { EnabledEmailFactorException } from './enabled-email-factor.exception';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { NotificationBy } from 'src/notifications/types/notification-by';

@Catch(EnabledEmailFactorException)
export class EnabledEmailFactorFilter implements ExceptionFilter {
  constructor(
    private readonly notificationFactory: NotificationFactory,
    private readonly codesService: VerificationCodesService,
  ) {}

  async catch(exception: EnabledEmailFactorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const account = exception.getResponse() as AccountWithCredentials;

    const receiver = account[account.two_factor_auth.via];

    const via = NotificationBy.EMAIL;

    const process = CodeProcess.LOGIN_TFA_EMAIL_FOR_ACCOUNT;

    const alreadySent = await this.codesService.getOneByReceiverAndProcess(
      receiver,
      process,
    );

    if (alreadySent) {
      return response.status(403).json({
        statusCode: 403,
        error: 'Forbidden',
        message: CodeMessages.ALREADY_SENT,
      });
    }

    await this.notificationFactory
      .createNotification(via)
      .notifyForTFA(via, process);

    return response.status(200).json({
      following_link: AUTH_ROUTE + AuthRoutes.VERIFY_LOGIN,
      message: CodeMessages.CODE_SENT_TO_MAIL,
    });
  }
}
