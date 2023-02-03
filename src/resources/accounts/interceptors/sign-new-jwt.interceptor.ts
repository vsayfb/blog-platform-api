import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { map } from 'rxjs';
import { LocalAuthService } from 'src/auth/services/local-auth.service';
import { RegisterType } from '../entities/account.entity';
import { AccountMessages } from '../enums/account-messages';
import { SelectedAccountFields } from '../types/selected-account-fields';

@Injectable()
export class SignNewJwtToken implements NestInterceptor, OnModuleInit {
  private localAuthService: LocalAuthService;

  constructor(private readonly moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.localAuthService = this.moduleRef.get(LocalAuthService, {
      strict: false,
    });
  }

  intercept(context: ExecutionContext, next: CallHandler<any>) {
    return next.handle().pipe(
      map(
        (value: { data: SelectedAccountFields; message: AccountMessages }) => {
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
