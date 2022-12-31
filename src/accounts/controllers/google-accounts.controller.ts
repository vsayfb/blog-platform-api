import {
  Body,
  Controller,
  ForbiddenException,
  Injectable,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoogleUserCredentials } from 'src/apis/google/google.service';
import { Client } from 'src/auth/decorator/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE,
  GOOGLE_ACCOUNTS_ROUTE,
} from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { starEmail, starMobilePhone } from 'src/lib/star-text';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { TwoFactorAuth } from 'src/tfa/entities/two-factor-auth.entity';
import { TwoFactorAuthService } from 'src/tfa/services/two-factor-auth.service';
import { VerificationCodeObj } from 'src/verification_codes/decorators/verification-code.decorator';
import { VerificationCodeDto } from 'src/verification_codes/dto/verification-code.dto';
import { VerificationTokenDto } from 'src/verification_codes/dto/verification-token.dto';
import {
  CodeProcess,
  VerificationCode,
} from 'src/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { VerificationCodeMatches } from 'src/verification_codes/guards/check-verification-code-matches.guard';
import { AccountCredentials } from '../decorators/account.decorator';
import { VerifiedGoogleUser } from '../decorators/google-user.decorator';
import { Account } from '../entities/account.entity';
import { AccountMessages } from '../enums/account-messages';
import { AccountRoutes } from '../enums/account-routes';
import { IsGoogleAccount } from '../guards/is-google-account.guard';
import { VerifyGoogleUser } from '../guards/verify-google-user.guard';
import { UpdateGoogleAccountPasswordDto } from '../request-dto/update-google-account-password.dto';
import { AccountsService } from '../services/accounts.service';
import { GoogleAccountsService } from '../services/google-accounts.service';

@Controller(GOOGLE_ACCOUNTS_ROUTE)
@ApiTags(GOOGLE_ACCOUNTS_ROUTE)
export class GoogleAccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly googleAccountsService: GoogleAccountsService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  @UseGuards(JwtAuthGuard, IsGoogleAccount, VerifyGoogleUser)
  @Patch(AccountRoutes.UPDATE_PASSWORD)
  async updatePassword(
    @Client() client: JwtPayload,
    @Body() body: UpdateGoogleAccountPasswordDto,
  ) {
    const account = await this.googleAccountsService.getOneByID(client.sub);

    await this.accountsService.update(account as Account, {
      password: body.new_password,
    });

    return {
      data: null,
      message: AccountMessages.PASSWORD_UPDATED,
    };
  }

  @Post(AccountRoutes.VERIFY_PROCESS + ':token')
  @UseGuards(JwtAuthGuard, IsGoogleAccount, VerificationCodeMatches)
  async makeProcessOfCode(
    @Client() client: JwtPayload,
    @Param() params: VerificationTokenDto,
    @Body() body: VerificationCodeDto,
    @VerificationCodeObj() verification_code: VerificationCode,
  ) {
    const { process } = verification_code;

    const account = await this.googleAccountsService.getOneByID(client.sub);

    switch (process) {
      case CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT:
        await this.accountsService.update(account as Account, {
          mobile_phone: verification_code.receiver,
        });
        return {
          data: { mobile_phone: starMobilePhone(verification_code.receiver) },
          message: AccountMessages.PHONE_ADDED,
        };
      case CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT:
        await this.accountsService.update(account as Account, {
          mobile_phone: null,
        });

        const tfa = await this.twoFactorAuthService.getOneByAccountID(
          client.sub,
        );

        if (tfa && tfa.via === NotificationBy.MOBILE_PHONE) {
          this.twoFactorAuthService.delete(tfa as TwoFactorAuth);
        }

        return {
          data: { mobile_phone: null },
          message: AccountMessages.PHONE_REMOVED,
        };
      default:
        throw new ForbiddenException(CodeMessages.INVALID_CODE);
    }
  }
}
