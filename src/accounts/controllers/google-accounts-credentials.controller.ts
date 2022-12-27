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
  GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE,
} from 'src/lib/constants';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { VerificationCodeProcess } from 'src/verification_codes/decorators/code-process.decorator';
import { NotificationTo } from 'src/verification_codes/decorators/notification-by.decorator';
import { CodeProcess } from 'src/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { VerificationCodeAlreadySent } from 'src/verification_codes/guards/code-already-sent.guard';
import { AccountCredentials } from '../decorators/account.decorator';
import { AccountMessages } from '../enums/account-messages';
import { AccountRoutes } from '../enums/account-routes';
import { PasswordsMatch } from '../guards/passwords-match.guard';
import { AddNewPhoneDto } from '../request-dto/add-new-phone.dto';
import { PasswordDto } from '../request-dto/password.dto';
import { AccountWithCredentials } from '../types/account-with-credentials';

@Controller(GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE)
@ApiTags(GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE)
export class GoogleAccountsCredentialsController {
  constructor(private readonly notificationFactory: NotificationFactory) {}

  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @VerificationCodeProcess(CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT)
  @UseGuards(JwtAuthGuard, PasswordsMatch, VerificationCodeAlreadySent)
  @Post(AccountRoutes.ADD_MOBILE_PHONE)
  async addNewPhone(
    @AccountCredentials() account: AccountWithCredentials,
    @Body() body: AddNewPhoneDto,
  ) {
    if (account.mobile_phone)
      throw new ForbiddenException(AccountMessages.HAS_PHONE);

    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.MOBILE_PHONE,
    );

    const code = await notificationFactory.notifyForTFA(
      body.mobile_phone,
      CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT,
    );

    return {
      data: ACCOUNTS_ROUTE + AccountRoutes.VERIFY_PROCESS + code.url_token,
      message: CodeMessages.CODE_SENT_TO_PHONE,
    };
  }

  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @VerificationCodeProcess(CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT)
  @UseGuards(JwtAuthGuard, PasswordsMatch, VerificationCodeAlreadySent)
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
}
