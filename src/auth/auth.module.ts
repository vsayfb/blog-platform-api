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
import { AUTH_ROUTE } from 'src/lib/constants';
import { AuthRoutes } from './enums/auth-routes';
import { TFADto } from 'src/security/dto/two-factor-auth.dto';

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
  controllers: [LocalAuthController, GoogleAuthController],
  providers: [LocalAuthService, GoogleAuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(validateBodyDto(TFADto)).forRoutes({
      path: AUTH_ROUTE + AuthRoutes.VERIFY_LOGIN,
      method: RequestMethod.POST,
    });
  }
}
