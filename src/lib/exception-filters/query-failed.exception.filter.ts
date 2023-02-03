import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggingWorker } from 'src/global/queues/workers/logging.worker';
import { LogData } from 'src/logging/types/log-data.type';
import { QueryFailedError } from 'typeorm';
import { calcResponseTime } from '../calc-response-time';
import { JwtPayload } from '../jwt.payload';
import {
  QUERY_FAILED,
  INVALID_QUERY_SYNTAX,
} from './messages/query-failed-messages';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingWorker: LoggingWorker) {}

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const http = host.switchToHttp();

    const request = host
      .switchToHttp()
      .getRequest<
        Request & { user: undefined | JwtPayload; start_time: Date }
      >();

    const response = http.getResponse<Response>();

    const endTime = new Date();

    const log: LogData = {
      client_id: request.user?.sub || 'guest',
      start_time: request.start_time,
      request_method: request.method,
      request_url: request.url,
      end_time: endTime,
      response_time: calcResponseTime(request.start_time, endTime),
      exception: exception.stack,
    };

    this.loggingWorker.produce(log);

    return response.status(HttpStatus.BAD_REQUEST).send({
      statusCode: HttpStatus.BAD_REQUEST,
      error: QUERY_FAILED,
      message: INVALID_QUERY_SYNTAX,
    });
  }
}
