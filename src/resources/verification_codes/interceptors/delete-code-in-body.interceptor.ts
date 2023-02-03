import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { VerificationCodesService } from '../verification-codes.service';

@Injectable()
export class DeleteVerificationCodeInBody implements NestInterceptor {
  private codesService: VerificationCodesService;

  constructor(private readonly moduleRef: ModuleRef) {
    this.codesService = moduleRef.get(VerificationCodesService, {
      strict: false,
    });
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((value) => {
        if (request.body.verification_code) {
          this.codesService.deleteByCode(request.body.verification_code);
        }

        return value;
      }),
    );
  }
}
