import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';
import { AuthRoutes } from 'src/auth/enums/auth-routes';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';
import { AUTH_ROUTE } from 'src/lib/constants';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { CodeProcess } from 'src/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { EnabledMobilePhoneFactorException } from './enabled-mobile-phone-factor.exception';

@Catch(EnabledMobilePhoneFactorException)
export class EnabledMobilePhoneFactorFilter implements ExceptionFilter {
  constructor(
    private readonly notificationFactory: NotificationFactory,
    private readonly codesService: VerificationCodesService,
  ) {}

  async catch(
    exception: EnabledMobilePhoneFactorException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const account = exception.getResponse() as AccountWithCredentials;

    const via = NotificationBy.MOBILE_PHONE;
    const receiver = account[via];
    const process = CodeProcess.LOGIN_TFA_MOBILE_PHONE;

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

    const notificationFactory =
      this.notificationFactory.createNotification(via);

    const code = await notificationFactory.notifyForTFA(receiver, process);

    return response.status(200).json({
      following_link: AUTH_ROUTE + AuthRoutes.VERIFY_TFA_LOGIN + code.token,
      message: CodeMessages.CODE_SENT_TO_PHONE,
    });
  }
}
