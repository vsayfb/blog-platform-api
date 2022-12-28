import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ACCOUNTS_ROUTE,
  LOCAL_ACCOUNTS_CREDENTIALS_ROUTE,
} from 'src/lib/constants';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { VerificationCodeProcess } from 'src/verification_codes/decorators/code-process.decorator';
import { NotificationTo } from 'src/verification_codes/decorators/notification-by.decorator';
import { CodeProcess } from 'src/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { VerificationCodeAlreadySentToAccount } from 'src/verification_codes/guards/code-already-sent.guard';
import { AccountCredentials } from '../decorators/account.decorator';
import { AccountMessages } from '../enums/account-messages';
import { AccountRoutes } from '../enums/account-routes';
import { IsLocalAccount } from '../guards/is-local-account.guard';
import { PasswordsMatch } from '../guards/passwords-match.guard';
import { AddNewEmail } from '../request-dto/add-new-email.dto';
import { AddNewPhoneDto } from '../request-dto/add-new-phone.dto';
import { PasswordDto } from '../request-dto/password.dto';
import { AccountWithCredentials } from '../types/account-with-credentials';

@Controller(LOCAL_ACCOUNTS_CREDENTIALS_ROUTE)
@ApiTags(LOCAL_ACCOUNTS_CREDENTIALS_ROUTE)
export class LocalAccountsCredentialsController {
  constructor(private readonly notificationFactory: NotificationFactory) {}

  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @VerificationCodeProcess(CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT)
  @UseGuards(
    JwtAuthGuard,
    IsLocalAccount,
    PasswordsMatch,
    VerificationCodeAlreadySentToAccount,
  )
  @Post(AccountRoutes.ADD_MOBILE_PHONE)
  async addNewPhone(
    @AccountCredentials() account: AccountWithCredentials,
    @Body() dto: AddNewPhoneDto,
  ) {
    if (account.mobile_phone)
      throw new ForbiddenException(AccountMessages.HAS_PHONE);

    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.MOBILE_PHONE,
    );

    const code = await notificationFactory.notifyForTFA(
      dto.mobile_phone,
      CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT,
    );

    return {
      data: ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.url_token,
      message: CodeMessages.CODE_SENT_TO_PHONE,
    };
  }

  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @VerificationCodeProcess(CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT)
  @UseGuards(
    JwtAuthGuard,
    IsLocalAccount,
    PasswordsMatch,
    VerificationCodeAlreadySentToAccount,
  )
  @Post(AccountRoutes.REMOVE_MOBILE_PHONE)
  async removeMobilPhone(
    @AccountCredentials() account: AccountWithCredentials,
    @Body() body: PasswordDto,
  ) {
    if (!account.email) {
      throw new ForbiddenException(
        'The account must have a phone number or email address.',
      );
    }

    const mobilePhone = this.notificationFactory.createNotification(
      NotificationBy.MOBILE_PHONE,
    );

    const code = await mobilePhone.notifyForTFA(
      account.mobile_phone,
      CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT,
    );

    return {
      data: ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.url_token,
      message: CodeMessages.CODE_SENT_TO_PHONE,
    };
  }

  @NotificationTo(NotificationBy.EMAIL)
  @VerificationCodeProcess(CodeProcess.ADD_EMAIL_TO_ACCOUNT)
  @UseGuards(
    JwtAuthGuard,
    IsLocalAccount,
    PasswordsMatch,
    VerificationCodeAlreadySentToAccount,
  )
  @Post(AccountRoutes.ADD_EMAIL)
  async addEmail(
    @AccountCredentials() account: AccountWithCredentials,
    @Body() dto: AddNewEmail,
  ) {
    if (account.email) throw new ForbiddenException(AccountMessages.HAS_EMAIL);

    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.EMAIL,
    );

    const code = await notificationFactory.notifyForTFA(
      dto.email,
      CodeProcess.ADD_EMAIL_TO_ACCOUNT,
    );

    return {
      data: ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.url_token,
      message: CodeMessages.CODE_SENT_TO_MAIL,
    };
  }

  @NotificationTo(NotificationBy.EMAIL)
  @VerificationCodeProcess(CodeProcess.REMOVE_EMAIL_FROM_ACCOUNT)
  @UseGuards(
    JwtAuthGuard,
    IsLocalAccount,
    PasswordsMatch,
    VerificationCodeAlreadySentToAccount,
  )
  @Post(AccountRoutes.REMOVE_EMAIL)
  async removeEmail(
    @AccountCredentials() account: AccountWithCredentials,
    @Body() body: PasswordDto,
  ) {
    if (!account.email) throw new ForbiddenException(AccountMessages.HAS_EMAIL);

    if (!account.mobile_phone)
      throw new ForbiddenException(
        'Account has to a mobile phone to sure account is not a bot.',
      );

    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.EMAIL,
    );

    const code = await notificationFactory.notifyForTFA(
      account.email,
      CodeProcess.REMOVE_EMAIL_FROM_ACCOUNT,
    );

    return {
      data: ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.url_token,
      message: CodeMessages.CODE_SENT_TO_MAIL,
    };
  }

  @Post(AccountRoutes.CHANGE_PASSWORD)
  @UseGuards(JwtAuthGuard, IsLocalAccount, PasswordsMatch)
  async changePassword(
    @AccountCredentials() account: AccountWithCredentials,
    @Body() body: PasswordDto,
  ) {
    let notifyBy: NotificationBy;

    if (account.two_factor_auth) {
      notifyBy = account.two_factor_auth.via;
    } else if (account.email) {
      notifyBy = NotificationBy.EMAIL;
    } else {
      notifyBy = NotificationBy.MOBILE_PHONE;
    }

    const notificationFactory =
      this.notificationFactory.createNotification(notifyBy);

    const code = await notificationFactory.notifyForTFA(
      account[notifyBy],
      CodeProcess.UPDATE_PASSWORD,
    );

    return {
      following_link:
        ACCOUNTS_ROUTE + AccountRoutes.UPDATE_PASSWORD + code.url_token,
      message:
        notifyBy === NotificationBy.EMAIL
          ? CodeMessages.CODE_SENT_TO_MAIL
          : CodeMessages.CODE_SENT_TO_PHONE,
    };
  }
}
