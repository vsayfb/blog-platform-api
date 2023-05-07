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
  GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE,
  GOOGLE_ACCOUNTS_ROUTE,
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
import { PasswordsMatch } from '../guards/passwords-match.guard';
import { NewMobilePhoneDto } from '../request-dto/new-mobile-phone.dto';
import { PasswordDto } from '../request-dto/password.dto';
import { AccountWithCredentials } from '../types/account-with-credentials';

@Controller(GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE)
@ApiTags(GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE)
export class GoogleAccountsCredentialsController {
  constructor(private readonly notificationFactory: NotificationFactory) {}

  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @VerificationCodeProcess(CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT)
  @FollowingURL(GOOGLE_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS)
  @UseGuards(JwtAuthGuard, PasswordsMatch, VerificationCodeAlreadySentToAccount)
  @Post(AccountRoutes.ADD_MOBILE_PHONE)
  async addMobilePhone(
    @AccountCredentials() account: AccountWithCredentials,
    @Body() body: NewMobilePhoneDto,
  ) {
    if (account.mobile_phone)
      throw new ForbiddenException(AccountMessages.HAS_MOBILE_PHONE);

    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.MOBILE_PHONE,
    );

    const code = await notificationFactory.notifyForTFA(
      body.mobile_phone,
      CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT,
    );

    return {
      following_url:
        GOOGLE_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.token,
      message: CodeMessages.CODE_SENT_TO_MOBILE_PHONE,
    };
  }

  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @VerificationCodeProcess(CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT)
  @FollowingURL(GOOGLE_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS)
  @UseGuards(JwtAuthGuard, PasswordsMatch, VerificationCodeAlreadySentToAccount)
  @Post(AccountRoutes.REMOVE_MOBILE_PHONE)
  async removeMobilPhone(
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
        GOOGLE_ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.token,
      message: CodeMessages.CODE_SENT_TO_MOBILE_PHONE,
    };
  }
}
