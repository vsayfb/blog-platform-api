import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AccountsModule } from 'src/accounts/accounts.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { GoogleModule } from 'src/apis/google/google.module';
import { ProcessEnv } from 'src/lib/enums/env';
import { LocalAuthController } from './controllers/local-auth.controller';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { GoogleAuthService } from './services/google-auth.service';
import { LocalAuthService } from './services/local-auth.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { VerificationCodesModule } from 'src/verification_codes/verification-codes.module';
import { validateBodyDto } from 'src/lib/middlewares/validate-body-dto';
import { AUTH_ROUTE, LOCAL_AUTH_ROUTE } from 'src/lib/constants';
import { AuthRoutes } from './enums/auth-routes';
import { TFADto } from 'src/tfa/dto/two-factor-auth.dto';
import { validateParamDto } from 'src/lib/middlewares/validate-param.dto';
import { VerificationTokenDto } from 'src/verification_codes/dto/verification-token.dto';
import { VerificationCodeDto } from 'src/verification_codes/dto/verification-code.dto';
import { AuthFactory } from './auth.factory';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    AccountsModule,
    PassportModule,
    NotificationsModule,
    VerificationCodesModule,
    GoogleModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(ProcessEnv.JWT_SECRET),
        signOptions: {
          expiresIn: configService.get<string>(ProcessEnv.JWT_EXPIRES_IN),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, LocalAuthController, GoogleAuthController],
  providers: [
    LocalAuthService,
    GoogleAuthService,
    LocalStrategy,
    JwtStrategy,
    AuthFactory,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    /** AUTH ROUTES */

    consumer
      .apply(
        validateParamDto(VerificationTokenDto),
        validateBodyDto(VerificationCodeDto),
      )
      .forRoutes({
        path: AUTH_ROUTE + AuthRoutes.VERIFY_TFA_LOGIN + ':token',
        method: RequestMethod.POST,
      });

    /** AUTH ROUTES */

    /** LOCAL AUTH ROUTES */

    consumer
      .apply(
        validateParamDto(VerificationTokenDto),
        validateBodyDto(VerificationCodeDto),
      )
      .forRoutes({
        path: AUTH_ROUTE + AuthRoutes.VERIFY_REGISTER + ':token',
        method: RequestMethod.POST,
      });

    /** LOCAL AUTH ROUTES */
  }
}
