import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LOCAL_ACCOUNT_TFA, TFA_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { TwoFactorAuth } from '../entities/two-factor-auth.entity';
import { TFAMessages } from '../enums/tfa-messages';
import { TFARoutes } from '../enums/tfa-routes';
import { TwoFactorAuthService } from '../services/two-factor-auth.service';
import { TwoFactorAuthManager } from '../services/two-factor-auth-manager.service';
import { Client } from 'src/auth/decorator/client.decorator';
import {
  CodeProcess,
  VerificationCode,
} from 'src/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { DeleteVerificationCodeInBody } from 'src/verification_codes/interceptors/delete-code-in-body.interceptor';
import { SelectedTFAFields } from '../types/selected-tfa';
import { VerificationCodeObj } from 'src/verification_codes/decorators/verification-code.decorator';
import { PasswordsMatch } from 'src/accounts/guards/passwords-match.guard';
import { VerificationCodeMatches } from 'src/verification_codes/guards/check-verification-code-matches.guard';
import { AccountCredentials } from 'src/accounts/decorators/account.decorator';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { VerificationCodeAlreadySentToAccount } from 'src/verification_codes/guards/code-already-sent.guard';
import { VerificationCodeProcess } from 'src/verification_codes/decorators/code-process.decorator';
import { NotificationTo } from 'src/verification_codes/decorators/notification-by.decorator';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { IsLocalAccount } from 'src/accounts/guards/is-local-account.guard';

@Controller(LOCAL_ACCOUNT_TFA)
@ApiTags(LOCAL_ACCOUNT_TFA)
@UseGuards(JwtAuthGuard, IsLocalAccount)
export class LocalAccountTFAController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly twoFactorAuthManager: TwoFactorAuthManager,
  ) {}

  @VerificationCodeProcess(CodeProcess.ENABLE_TFA_EMAIL_FACTOR)
  @NotificationTo(NotificationBy.EMAIL)
  @UseGuards(PasswordsMatch, VerificationCodeAlreadySentToAccount)
  @Post(TFARoutes.ENABLE_WITH_EMAIL_FACTOR)
  async enable2FAWithEmail(
    @AccountCredentials() account: AccountWithCredentials,
  ): Promise<{ following_link: string; message: CodeMessages }> {
    if (!account.email)
      throw new ForbiddenException(AccountMessages.HAS_NOT_EMAIL);

    const code = await this.twoFactorAuthManager.enable({
      by: NotificationBy.EMAIL,
      accountID: account.id,
    });

    return {
      following_link: TFA_ROUTE + TFARoutes.CREATE + code.url_token,
      message: CodeMessages.CODE_SENT_TO_MAIL,
    };
  }

  @VerificationCodeProcess(CodeProcess.ENABLE_TFA_MOBILE_PHONE_FACTOR)
  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @UseGuards(PasswordsMatch, VerificationCodeAlreadySentToAccount)
  @Post(TFARoutes.ENABLE_WITH_MOBILE_PHONE)
  async enable2FAWithMobilePhone(
    @AccountCredentials() account: AccountWithCredentials,
  ): Promise<{ following_link: string; message: CodeMessages }> {
    if (!account.mobile_phone)
      throw new ForbiddenException(AccountMessages.HAS_NOT_PHONE);

    const code = await this.twoFactorAuthManager.enable({
      by: NotificationBy.MOBILE_PHONE,
      accountID: account.id,
    });

    return {
      following_link: TFA_ROUTE + TFARoutes.CREATE + code.url_token,
      message: CodeMessages.CODE_SENT_TO_PHONE,
    };
  }

  @UseGuards(JwtAuthGuard, VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(TFARoutes.CREATE + ':token')
  async makeProcessOfCode(
    @Client() client: JwtPayload,
    @VerificationCodeObj() verification_code: VerificationCode,
  ): Promise<{
    data: SelectedTFAFields;
    message: TFAMessages;
  }> {
    const { process } = verification_code;

    if (!process.includes('ENABLE_TFA')) {
      throw new ForbiddenException(CodeMessages.INVALID_CODE);
    } else {
      const via =
        process === CodeProcess.ENABLE_TFA_EMAIL_FACTOR
          ? NotificationBy.EMAIL
          : NotificationBy.MOBILE_PHONE;

      const tfa = await this.twoFactorAuthService.create({
        via,
        accountID: client.sub,
      });

      return { data: tfa, message: TFAMessages.TFA_ENABLED };
    }
  }
}
