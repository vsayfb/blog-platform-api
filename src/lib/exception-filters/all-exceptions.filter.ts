import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';
import {
  INTERNAL_SERVER_ERROR,
  INTERNAL_SERVER_MESSAGE,
} from './messages/all-exceptions-messages';

export class AllExceptionsFilter extends BaseExceptionFilter {
  async catch(exception: any, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      super.catch(exception, host);
    } else {
      const http = host.switchToHttp();

      const request = http.getRequest<Request>();

      const response = http.getResponse<Response>();

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: INTERNAL_SERVER_ERROR,
        message: INTERNAL_SERVER_MESSAGE,
      });
    }
  }
}
