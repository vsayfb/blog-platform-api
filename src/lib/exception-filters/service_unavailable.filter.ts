import {
  ArgumentsHost,
  BadGatewayException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggingWorker } from 'src/global/queues/workers/logging.worker';
import { LogData } from 'src/logging/types/log-data.type';
import { calcResponseTime } from '../calc-response-time';
import {
  SENDING_FAILED,
  SERVICE_UNAVAILABLE,
} from './messages/service_unavailable-messages';

@Catch(BadGatewayException)
export class ServiceUnavailableExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingWorker: LoggingWorker) {}

  catch(exception: BadGatewayException, host: ArgumentsHost) {
    const http = host.switchToHttp();

    const request = host.switchToHttp().getRequest();

    const response = http.getResponse<Response>();

    const endTime = new Date();

    const log: LogData = {
      client_id: 'new_user',
      start_time: request.start_time,
      request_method: request.method,
      request_url: request.url,
      end_time: endTime,
      response_time: calcResponseTime(request.start_time, endTime),
      exception: exception.stack ? exception.stack : exception,
    };

    this.loggingWorker.produce(log);

    return response.status(HttpStatus.BAD_GATEWAY).send({
      statusCode: HttpStatus.BAD_GATEWAY,
      error: SERVICE_UNAVAILABLE,
      message: SENDING_FAILED,
    });
  }
}
