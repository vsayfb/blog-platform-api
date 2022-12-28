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
  LOCAL_ACCOUNTS_CREDENTIALS_ROUTE,
  ACCOUNTS_ROUTE,
  MANAGE_DATA_SERVICE,
  GOOGLE_ACCOUNTS_ROUTE,
  GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE,
  LOCAL_ACCOUNTS_ROUTE,
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
import { LocalAccountsCredentialsController } from './controllers/local-accounts-credentials.controller';
import { PasswordDto } from './request-dto/password.dto';
import { AddNewEmail } from './request-dto/add-new-email.dto';
import { LocalAccountsService } from './services/local-accounts.service';
import { GoogleAccountsController } from './controllers/google-accounts.controller';
import { GoogleAccountsCredentialsController } from './controllers/google-accounts-credentials.controller';
import { LocalAccountsController } from './controllers/local-accounts.controller';
import { UniqueMobilePhoneDto } from './request-dto/unique-mobile-phone.dto';
import { UpdateGoogleAccountPasswordDto } from './request-dto/update-google-account-password.dto';
import { GoogleModule } from 'src/apis/google/google.module';
import { TemporaryAccount } from './entities/temporary-account.entity';
import { TemporaryAccountsService } from './services/temporary-accounts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, TemporaryAccount]),
    GoogleModule,
    UploadsModule,
    NotificationsModule,
    VerificationCodesModule,
  ],
  controllers: [
    AccountsController,
    LocalAccountsController,
    GoogleAccountsController,
    LocalAccountsCredentialsController,
    GoogleAccountsCredentialsController,
  ],
  providers: [
    AccountsService,
    TemporaryAccountsService,
    GoogleAccountsService,
    LocalAccountsService,
    PasswordManagerService,
    CheckUniqueUsername,
    CheckUniqueEmail,
    CheckUniquePhone,
    CheckAccountExists,
    { provide: MANAGE_DATA_SERVICE, useClass: AccountsService },
  ],
  exports: [
    AccountsService,
    TemporaryAccountsService,
    GoogleAccountsService,
    LocalAccountsService,
    PasswordManagerService,
  ],
})
export class AccountsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    /** GOOGLE ACCOUNTS CREDENTIALS ROUTE */
    consumer
      .apply(
        validateBodyDto(PasswordDto),
        validateBodyDto(UniqueMobilePhoneDto),
      )
      .forRoutes({
        path:
          GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE + AccountRoutes.ADD_MOBILE_PHONE,
        method: RequestMethod.POST,
      });

    consumer.apply(validateBodyDto(PasswordDto)).forRoutes({
      path:
        GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE + AccountRoutes.REMOVE_MOBILE_PHONE,
      method: RequestMethod.POST,
    });
    /** GOOGLE ACCOUNTS CREDENTIALS ROUTE */

    /** GOOGLE ACCOUNTS ROUTE */
    consumer
      .apply(
        validateParamDto(VerificationTokenDto),
        validateBodyDto(VerificationCodeDto),
      )
      .forRoutes({
        path: GOOGLE_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + ':token',
        method: RequestMethod.POST,
      });

    consumer.apply(validateBodyDto(UpdateGoogleAccountPasswordDto)).forRoutes({
      path: GOOGLE_ACCOUNTS_ROUTE + AccountRoutes.UPDATE_PASSWORD,
      method: RequestMethod.POST,
    });
    /** GOOGLE ACCOUNTS ROUTE */

    /** LOCAL ACCOUNTS CREDENTIALS ROUTE */
    consumer.apply(validateBodyDto(AddNewPhoneDto)).forRoutes({
      path: LOCAL_ACCOUNTS_CREDENTIALS_ROUTE + AccountRoutes.ADD_MOBILE_PHONE,
      method: RequestMethod.POST,
    });
    consumer.apply(validateBodyDto(PasswordDto)).forRoutes({
      path:
        LOCAL_ACCOUNTS_CREDENTIALS_ROUTE + AccountRoutes.REMOVE_MOBILE_PHONE,
      method: RequestMethod.POST,
    });
    consumer.apply(validateBodyDto(AddNewEmail)).forRoutes({
      path: LOCAL_ACCOUNTS_CREDENTIALS_ROUTE + AccountRoutes.ADD_EMAIL,
      method: RequestMethod.POST,
    });
    consumer.apply(validateBodyDto(PasswordDto)).forRoutes({
      path: LOCAL_ACCOUNTS_CREDENTIALS_ROUTE + AccountRoutes.REMOVE_EMAIL,
      method: RequestMethod.POST,
    });
    consumer.apply(validateBodyDto(PasswordDto)).forRoutes({
      path: LOCAL_ACCOUNTS_CREDENTIALS_ROUTE + AccountRoutes.CHANGE_PASSWORD,
      method: RequestMethod.POST,
    });
    /** LOCAL ACCOUNTS CREDENTIALS ROUTE */

    /** LOCAL ACCOUNTS ROUTE */

    consumer
      .apply(
        validateParamDto(VerificationTokenDto),
        validateBodyDto(VerificationCodeDto),
      )
      .forRoutes({
        path: LOCAL_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + ':token',
        method: RequestMethod.POST,
      });

    consumer
      .apply(
        validateParamDto(VerificationTokenDto),
        validateBodyDto(NewPasswordDto),
      )
      .forRoutes({
        path: LOCAL_ACCOUNTS_ROUTE + AccountRoutes.UPDATE_PASSWORD + ':token',
        method: RequestMethod.POST,
      });

    /** LOCAL ACCOUNTS ROUTE */
  }
}
