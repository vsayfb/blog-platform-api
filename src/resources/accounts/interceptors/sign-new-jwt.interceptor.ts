import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { LocalAuthService } from 'src/auth/services/local-auth.service';
import { RegisterType } from '../entities/account.entity';
import { AccountMessages } from '../enums/account-messages';
import { SelectedAccountFields } from '../types/selected-account-fields';

@Injectable()
export class SignNewJwtToken implements NestInterceptor, OnModuleInit {
  private localAuthService: LocalAuthService;

  constructor(private readonly moduleRef: ModuleRef) {}

  async onModuleInit() {
    // use global scope to prevent circular dependency between account -> auth modules

    this.localAuthService = this.moduleRef.get(LocalAuthService, {
      strict: false,
    });
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{
    data: { access_token: string; account: SelectedAccountFields };
    message: AccountMessages;
  }> {
    return next.handle().pipe(
      map(
        (value: {
          data: SelectedAccountFields;
          message: AccountMessages.UPDATED;
        }) => {
          const result = this.localAuthService.login(value.data);

          const { access_token } = result;

          return {
            data: { access_token, account: value.data },
            message: value.message,
          };
        },
      ),
    );
  }
}
