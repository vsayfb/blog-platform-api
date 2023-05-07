import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/auth/decorator/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GOOGLE_ACCOUNTS_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { starMobilePhone } from 'src/lib/star-text';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { TwoFactorAuth } from 'src/resources/tfa/entities/two-factor-auth.entity';
import { TwoFactorAuthService } from 'src/resources/tfa/services/two-factor-auth.service';
import { VerificationCodeObj } from 'src/resources/verification_codes/decorators/verification-code.decorator';
import { VerificationCodeDto } from 'src/resources/verification_codes/dto/verification-code.dto';
import { VerificationTokenDto } from 'src/resources/verification_codes/dto/verification-token.dto';
import {
  CodeProcess,
  VerificationCode,
} from 'src/resources/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/resources/verification_codes/enums/code-messages';
import { VerificationCodeMatches } from 'src/resources/verification_codes/guards/check-verification-code-matches.guard';
import { Account } from '../entities/account.entity';
import { AccountMessages } from '../enums/account-messages';
import { AccountRoutes } from '../enums/account-routes';
import { IsGoogleAccount } from '../guards/is-google-account.guard';
import { VerifyGoogleUser } from '../guards/verify-google-user.guard';
import { UpdateGoogleAccountPasswordDto } from '../request-dto/update-google-account-password.dto';
import { AccountsService } from '../services/accounts.service';
import { GoogleAccountsService } from '../services/google-accounts.service';
import { Verification } from '../../../lib/interfaces/verification-interface';

@Controller(GOOGLE_ACCOUNTS_ROUTE)
@ApiTags(GOOGLE_ACCOUNTS_ROUTE)
export class GoogleAccountsController implements Verification {
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
  ): Promise<{ data: null; message: AccountMessages }> {
    const account = (await this.googleAccountsService.getOneByID(
      client.sub,
    )) as Account;

    await this.accountsService.setPassword(account, body.new_password);

    await this.accountsService.update(account as Account);

    return {
      data: null,
      message: AccountMessages.PASSWORD_UPDATED,
    };
  }

  @Post(AccountRoutes.VERIFY_PROCESS + ':token')
  @UseGuards(JwtAuthGuard, IsGoogleAccount, VerificationCodeMatches)
  async process(
    @Client() client: JwtPayload,
    @Param() params: VerificationTokenDto,
    @Body() body: VerificationCodeDto,
    @VerificationCodeObj() verification_code: VerificationCode,
  ) {
    const { process } = verification_code;

    const account = (await this.googleAccountsService.getOneByID(
      client.sub,
    )) as Account;

    if (process === CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT) {
      this.accountsService.setMobilePhone(account, verification_code.receiver);

      await this.accountsService.update(account);
      return {
        data: { mobile_phone: starMobilePhone(verification_code.receiver) },
        message: AccountMessages.MOBILE_PHONE_ADDED,
      };
    } else if (process === CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT) {
      this.accountsService.setMobilePhone(account, null);

      await this.accountsService.update(account);

      const tfa = await this.twoFactorAuthService.getOneByAccountID(client.sub);

      if (tfa && tfa.via === NotificationBy.MOBILE_PHONE) {
        await this.twoFactorAuthService.delete(tfa as TwoFactorAuth);
      }

      return {
        data: { mobile_phone: null },
        message: AccountMessages.MOBILE_PHONE_REMOVED,
      };
    } else {
      throw new ForbiddenException(CodeMessages.INVALID_CODE);
    }
  }
}
