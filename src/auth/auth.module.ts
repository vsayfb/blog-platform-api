import { Module } from '@nestjs/common';
import { AuthService } from './services/local-auth.service';
import { AccountsModule } from 'src/accounts/accounts.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { GoogleModule } from 'src/apis/google/google.module';
import { CodesModule } from 'src/codes/codes.module';
import { ProcessEnv } from 'src/lib/enums/env';
import { LocalAuthController } from './controllers/local-auth.controller';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { GoogleAuthService } from './services/google-auth.service';
import { MailsModule } from 'src/mails/mails.module';

@Module({
  imports: [
    AccountsModule,
    PassportModule,
    CodesModule,
    MailsModule,
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
  providers: [AuthService, GoogleAuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
