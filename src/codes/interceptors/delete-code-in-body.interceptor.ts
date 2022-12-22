import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable } from 'rxjs';
import { CodesService } from '../codes.service';

@Injectable()
export class DeleteVerificationCodeInBody implements NestInterceptor {
  private codesService: CodesService;

  constructor(private readonly moduleRef: ModuleRef) {
    this.codesService = moduleRef.get(CodesService, { strict: false });
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    if (request.body.verification_code) {
      this.codesService.deleteByCode(request.body.verification_code);
    }

    return next.handle();
  }
}
