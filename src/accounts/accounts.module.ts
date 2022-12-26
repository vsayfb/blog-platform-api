import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AccountsService } from './services/accounts.service';
import { AccountsController } from './controllers/accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { UploadsModule } from 'src/uploads/uploads.module';
import { PasswordManagerService } from './services/password-manager.service';
import { GoogleAccountsService } from './services/google-accounts.service';
import {
  ACCOUNTS_2FA_ROUTE,
  ACCOUNTS_ROUTE,
  MANAGE_DATA_SERVICE,
} from 'src/lib/constants';
import { CheckUniqueUsername } from './validators/check-unique-username';
import { CheckUniqueEmail } from './validators/check-unique-email';
import { CheckAccountExists } from './validators/check-exists-by-id';
import { CheckUniquePhone } from './validators/check-unique.phone';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AccountRoutes } from './enums/account-routes';
import { validateBodyDto } from 'src/lib/middlewares/validate-body-dto';
import { NewPasswordDto } from './request-dto/new-password.dto';
import { VerificationCodeDto } from 'src/verification_codes/dto/verification-code.dto';
import { validateParamDto } from 'src/lib/middlewares/validate-param.dto';
import { VerificationTokenDto } from 'src/verification_codes/dto/verification-token.dto';
import { VerificationCodesModule } from 'src/verification_codes/verification-codes.module';
import { AddNewPhoneDto } from './request-dto/add-new-phone.dto';
import { Accounts2FAController } from './controllers/accounts.tfa.controller';
import { PasswordDto } from './request-dto/password.dto';
import { AddNewEmail } from './request-dto/add-new-email.dto';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    UploadsModule,
    NotificationsModule,
    VerificationCodesModule,
  ],
  controllers: [AccountsController, Accounts2FAController],
  providers: [
    AccountsService,
    GoogleAccountsService,
    PasswordManagerService,
    { provide: MANAGE_DATA_SERVICE, useClass: AccountsService },
    CheckUniqueUsername,
    CheckUniqueEmail,
    CheckUniquePhone,
    CheckAccountExists,
  ],
  exports: [AccountsService, GoogleAccountsService, PasswordManagerService],
})
export class AccountsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        validateParamDto(VerificationTokenDto),
        validateBodyDto(VerificationCodeDto),
      )
      .forRoutes({
        path: ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + ':token',
        method: RequestMethod.POST,
      });

    consumer
      .apply(
        validateParamDto(VerificationTokenDto),
        validateBodyDto(VerificationCodeDto),
        validateBodyDto(NewPasswordDto),
      )
      .forRoutes({
        path: ACCOUNTS_ROUTE + AccountRoutes.UPDATE_PASSWORD + ':token',
        method: RequestMethod.POST,
      });

    consumer.apply(validateBodyDto(AddNewPhoneDto)).forRoutes({
      path: ACCOUNTS_2FA_ROUTE + AccountRoutes.ADD_MOBILE_PHONE,
      method: RequestMethod.POST,
    });

    consumer.apply(validateBodyDto(AddNewEmail)).forRoutes({
      path: ACCOUNTS_2FA_ROUTE + AccountRoutes.ADD_EMAIL,
      method: RequestMethod.POST,
    });

    consumer.apply(validateBodyDto(PasswordDto)).forRoutes(
      {
        path: ACCOUNTS_2FA_ROUTE + AccountRoutes.REMOVE_MOBILE_PHONE,
        method: RequestMethod.POST,
      },
      {
        path: ACCOUNTS_2FA_ROUTE + AccountRoutes.REMOVE_EMAIL,
        method: RequestMethod.POST,
      },
    );
  }
}
