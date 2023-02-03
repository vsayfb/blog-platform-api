import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
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
import { LoggingWorker } from 'src/global/queues/workers/logging.worker';
import { LogData } from 'src/logging/types/log-data.type';
import { calcResponseTime } from 'src/lib/calc-response-time';

@Catch(EnabledMobilePhoneFactorException)
export class EnabledMobilePhoneFactorFilter implements ExceptionFilter {
  constructor(
    private readonly notificationFactory: NotificationFactory,
    private readonly codesService: VerificationCodesService,
    private readonly loggingWorker: LoggingWorker,
  ) {}

  async catch(
    exception: EnabledMobilePhoneFactorException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();

    const request = host
      .switchToHttp()
      .getRequest<Request & { start_time: Date }>();

    const response = ctx.getResponse<Response>();

    const account = exception.getResponse() as AccountWithCredentials;

    const via = NotificationBy.MOBILE_PHONE;
    const receiver = account[via];
    const process = CodeProcess.LOGIN_TFA_MOBILE_PHONE;

    const alreadySent = await this.codesService.getOneByReceiverAndProcess(
      receiver,
      process,
    );

    let endTime = new Date();

    const log: LogData = {
      client_id: account.id,
      start_time: request.start_time,
      request_method: request.method,
      request_url: request.url,
      end_time: endTime,
      response_time: calcResponseTime(request.start_time, endTime),
      exception,
    };

    if (alreadySent) {
      this.loggingWorker.produce(log);

      return response.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        message: CodeMessages.ALREADY_SENT,
      });
    }

    const notificationFactory =
      this.notificationFactory.createNotification(via);

    const code = await notificationFactory.notifyForTFA(receiver, process);

    const res = {
      following_link: AUTH_ROUTE + AuthRoutes.VERIFY_TFA_LOGIN + code.token,
      message: CodeMessages.CODE_SENT_TO_PHONE,
    };

    response.status(HttpStatus.OK).json(res);

    delete log.exception;
    endTime = new Date();
    log.response_time = calcResponseTime(request.start_time, endTime);

    this.loggingWorker.produce(log);
  }
}
