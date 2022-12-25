import { Module } from '@nestjs/common';
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
export class AuthModule {}
