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
  LOCAL_ACCOUNTS_ROUTE,
} from 'src/lib/constants';
import { FollowingURL } from 'src/lib/decorators/following-link.decorator';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { VerificationCodeProcess } from 'src/resources/verification_codes/decorators/code-process.decorator';
import { NotificationTo } from 'src/resources/verification_codes/decorators/notification-by.decorator';
import { CodeProcess } from 'src/resources/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/resources/verification_codes/enums/code-messages';
import { VerificationCodeAlreadySentToAccount } from 'src/resources/verification_codes/guards/code-already-sent.guard';
import { AccountCredentials } from '../decorators/account.decorator';
import { AccountMessages } from '../enums/account-messages';
import { AccountRoutes } from '../enums/account-routes';
import { IsLocalAccount } from '../guards/is-local-account.guard';
import { PasswordsMatch } from '../guards/passwords-match.guard';
import { NewEmailDto } from '../request-dto/add-new-email.dto';
import { NewMobilePhoneDto } from '../request-dto/new-mobile-phone.dto';
import { PasswordDto } from '../request-dto/password.dto';
import { AccountWithCredentials } from '../types/account-with-credentials';

@Controller(LOCAL_ACCOUNTS_CREDENTIALS_ROUTE)
@ApiTags(LOCAL_ACCOUNTS_CREDENTIALS_ROUTE)
export class LocalAccountsCredentialsController {
  constructor(private readonly notificationFactory: NotificationFactory) {}

  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @VerificationCodeProcess(CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT)
  @FollowingURL(LOCAL_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS)
  @UseGuards(
    JwtAuthGuard,
    IsLocalAccount,
    PasswordsMatch,
    VerificationCodeAlreadySentToAccount,
  )
  @Post(AccountRoutes.ADD_MOBILE_PHONE)
  async addMobilePhone(
    @AccountCredentials() account: AccountWithCredentials,
    @Body() dto: NewMobilePhoneDto,
  ) {
    if (account.mobile_phone)
      throw new ForbiddenException(AccountMessages.HAS_MOBILE_PHONE);

    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.MOBILE_PHONE,
    );

    const code = await notificationFactory.notifyForTFA(
      dto.mobile_phone,
      CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT,
    );

    return {
      following_url:
        LOCAL_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.token,
      message: CodeMessages.CODE_SENT_TO_MOBILE_PHONE,
    };
  }

  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @VerificationCodeProcess(CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT)
  @FollowingURL(LOCAL_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS)
  @UseGuards(
    JwtAuthGuard,
    IsLocalAccount,
    PasswordsMatch,
    VerificationCodeAlreadySentToAccount,
  )
  @Post(AccountRoutes.REMOVE_MOBILE_PHONE)
  async removeMobilePhone(
    @AccountCredentials() account: AccountWithCredentials,
    @Body() body: PasswordDto,
  ) {
    if (!account.mobile_phone)
      throw new ForbiddenException(AccountMessages.HAS_NOT_MOBILE_PHONE);

    if (!account.email)
      throw new ForbiddenException(AccountMessages.MUST_HAS_PHONE_OR_EMAIL);

    const mobilePhone = this.notificationFactory.createNotification(
      NotificationBy.MOBILE_PHONE,
    );

    const code = await mobilePhone.notifyForTFA(
      account.mobile_phone,
      CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT,
    );

    return {
      following_url:
        LOCAL_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.token,
      message: CodeMessages.CODE_SENT_TO_MOBILE_PHONE,
    };
  }

  @NotificationTo(NotificationBy.EMAIL)
  @VerificationCodeProcess(CodeProcess.ADD_EMAIL_TO_ACCOUNT)
  @FollowingURL(LOCAL_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS)
  @UseGuards(
    JwtAuthGuard,
    IsLocalAccount,
    PasswordsMatch,
    VerificationCodeAlreadySentToAccount,
  )
  @Post(AccountRoutes.ADD_EMAIL)
  async addEmail(
    @AccountCredentials() account: AccountWithCredentials,
    @Body() dto: NewEmailDto,
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
      following_url:
        LOCAL_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.token,
      message: CodeMessages.CODE_SENT_TO_EMAIL,
    };
  }

  @NotificationTo(NotificationBy.EMAIL)
  @VerificationCodeProcess(CodeProcess.REMOVE_EMAIL_FROM_ACCOUNT)
  @FollowingURL(LOCAL_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS)
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
    if (!account.email)
      throw new ForbiddenException(AccountMessages.HAS_NOT_EMAIL);

    if (!account.mobile_phone)
      throw new ForbiddenException(AccountMessages.MUST_HAS_PHONE_OR_EMAIL);

    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.EMAIL,
    );

    const code = await notificationFactory.notifyForTFA(
      account.email,
      CodeProcess.REMOVE_EMAIL_FROM_ACCOUNT,
    );

    return {
      following_url:
        LOCAL_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.token,
      message: CodeMessages.CODE_SENT_TO_EMAIL,
    };
  }

  @Post(AccountRoutes.CHANGE_PASSWORD)
  @FollowingURL(LOCAL_ACCOUNTS_ROUTE + AccountRoutes.UPDATE_PASSWORD)
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
      following_url:
        LOCAL_ACCOUNTS_ROUTE + AccountRoutes.UPDATE_PASSWORD + code.token,
      message:
        notifyBy === NotificationBy.EMAIL
          ? CodeMessages.CODE_SENT_TO_EMAIL
          : CodeMessages.CODE_SENT_TO_MOBILE_PHONE,
    };
  }
}
