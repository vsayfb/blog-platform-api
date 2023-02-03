import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { LoggingWorker } from 'src/global/queues/workers/logging.worker';
import { LogData } from '../types/log-data.type';
import { JwtPayload } from 'src/lib/jwt.payload';
import { calcResponseTime } from 'src/lib/calc-response-time';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingWorker: LoggingWorker) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<
      Request & {
        start_time: undefined | Date;
        user: JwtPayload | undefined;
      }
    >();

    request.start_time = new Date();

    return next.handle().pipe(
      tap(() => {
        const endTime = new Date();

        const data: LogData = {
          client_id: request.user?.sub || 'guest',
          start_time: request.start_time,
          request_method: request.method,
          request_url: request.url,
          response_time: calcResponseTime(request.start_time, endTime),
          end_time: endTime,
        };

        this.loggingWorker.produce(data);
      }),
    );
  }
}
