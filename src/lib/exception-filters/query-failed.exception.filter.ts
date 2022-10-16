import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import {
  QUERY_FAILED,
  INVALID_QUERY_SYNTAX,
} from './messages/query-failed-messages';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const http = host.switchToHttp();

    const response = http.getResponse<Response>();

    return response.status(HttpStatus.BAD_REQUEST).send({
      statusCode: HttpStatus.BAD_REQUEST,
      error: QUERY_FAILED,
      message: INVALID_QUERY_SYNTAX,
    });
  }
}
