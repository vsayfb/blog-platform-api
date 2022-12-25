import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MANAGE_DATA_SERVICE, TFA_ROUTE } from 'src/lib/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuth } from './entities/two-factor-auth.entity';
import { AccountsModule } from 'src/accounts/accounts.module';
import { TwoFactorAuthController } from './controllers/two-factor-auth.controller';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([TwoFactorAuth]),
    NotificationsModule,
    AccountsModule,
    VerificationCodesModule,
  ],
  controllers: [TwoFactorAuthController],
  providers: [
    TwoFactorAuthService,
    TwoFactorAuthManager,
    { provide: MANAGE_DATA_SERVICE, useClass: TwoFactorAuthService },
  ],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(validateBodyDto(PasswordDto)).forRoutes(
      {
        method: RequestMethod.POST,
        path: TFA_ROUTE + TFARoutes.ENABLE_WITH_EMAIL_FACTOR,
      },
      {
        method: RequestMethod.POST,
        path: TFA_ROUTE + TFARoutes.ENABLE_WITH_MOBILE_PHONE,
      },
    );

    consumer
      .apply(
        validateParamDto(VerificationTokenDto),
        validateBodyDto(VerificationCodeDto),
      )
      .forRoutes({
        method: RequestMethod.POST,
        path: TFA_ROUTE + TFARoutes.VERIFY_TFA + ':token',
      });
  }
}
