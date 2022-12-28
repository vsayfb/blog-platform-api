import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import {
  GOOGLE_ACCOUNT_TFA,
  LOCAL_ACCOUNT_TFA,
  MANAGE_DATA_SERVICE,
  TFA_ROUTE,
} from 'src/lib/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuth } from './entities/two-factor-auth.entity';
import { AccountsModule } from 'src/accounts/accounts.module';
import { LocalAccountTFAController } from './controllers/local-account-tfa.controller';
import { TwoFactorAuthService } from './services/two-factor-auth.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TwoFactorAuthManager } from './services/two-factor-auth-manager.service';
import { validateBodyDto } from 'src/lib/middlewares/validate-body-dto';
import { VerificationCodeDto } from 'src/verification_codes/dto/verification-code.dto';
import { TFARoutes } from './enums/tfa-routes';
import { PasswordDto } from 'src/accounts/request-dto/password.dto';
import { validateParamDto } from 'src/lib/middlewares/validate-param.dto';
import { VerificationTokenDto } from 'src/verification_codes/dto/verification-token.dto';
import { VerificationCodesModule } from 'src/verification_codes/verification-codes.module';
import { GoogleAccountTFAController } from './controllers/google-account-tfa.controller';
import { AccountTFAController } from './controllers/tfa-account.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TwoFactorAuth]),
    NotificationsModule,
    AccountsModule,
    VerificationCodesModule,
  ],
  controllers: [
    AccountTFAController,
    LocalAccountTFAController,
    GoogleAccountTFAController,
  ],
  providers: [
    TwoFactorAuthService,
    TwoFactorAuthManager,
    { provide: MANAGE_DATA_SERVICE, useClass: TwoFactorAuthService },
  ],
})
export class TwoFactorAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(validateBodyDto(PasswordDto)).forRoutes(
      {
        method: RequestMethod.POST,
        path: LOCAL_ACCOUNT_TFA + TFARoutes.ENABLE_WITH_EMAIL_FACTOR,
      },
      {
        method: RequestMethod.POST,
        path: LOCAL_ACCOUNT_TFA + TFARoutes.ENABLE_WITH_MOBILE_PHONE,
      },
      {
        method: RequestMethod.POST,
        path: GOOGLE_ACCOUNT_TFA + TFARoutes.ENABLE_WITH_MOBILE_PHONE,
      },
    );

    consumer
      .apply(
        validateParamDto(VerificationTokenDto),
        validateBodyDto(VerificationCodeDto),
      )
      .forRoutes(
        {
          method: RequestMethod.POST,
          path: LOCAL_ACCOUNT_TFA + TFARoutes.CREATE + ':token',
        },
        {
          method: RequestMethod.POST,
          path: GOOGLE_ACCOUNT_TFA + TFARoutes.CREATE + ':token',
        },
        {
          path: TFA_ROUTE + TFARoutes.DELETE + ':token',
          method: RequestMethod.DELETE,
        },
      );
  }
}
