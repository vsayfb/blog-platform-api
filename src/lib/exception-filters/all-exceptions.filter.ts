import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';
import {
  INTERNAL_SERVER_ERROR,
  INTERNAL_SERVER_MESSAGE,
} from './messages/all-exceptions-messages';
import { LoggingWorker } from 'src/global/queues/workers/logging.worker';
import { LogData } from 'src/logging/types/log-data.type';
import { JwtPayload } from '../jwt.payload';
import { calcResponseTime } from '../calc-response-time';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  @Inject(LoggingWorker)
  private readonly loggingWorker: LoggingWorker;

  async catch(exception: any, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<
      Request & {
        user: JwtPayload | undefined;
        url: string;
        method: string;
        start_time: Date;
      }
    >();

    const startTime = request.start_time;
    const response = http.getResponse<Response>();

    response.on('finish', () => {
      const endTime = new Date();

      const log: LogData = {
        client_id: request.user?.sub || 'guest',
        start_time: startTime ? startTime : endTime,
        request_method: request.method,
        request_url: request.url,
        response_time: calcResponseTime(request.start_time, endTime),
        end_time: endTime,
        exception: exception.stack ? exception.stack : exception,
      };

      this.loggingWorker.produce(log);
    });

    if (exception instanceof HttpException) {
      super.catch(exception, host);
    } else {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: INTERNAL_SERVER_ERROR,
        message: INTERNAL_SERVER_MESSAGE,
      });
    }
  }
}
