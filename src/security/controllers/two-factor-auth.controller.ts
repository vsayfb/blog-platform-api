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
import { TFA_ROUTE } from 'src/lib/constants';
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
import { VerificationCodeAlreadySent } from 'src/verification_codes/guards/code-already-sent.guard';
import { VerificationCodeProcess } from 'src/verification_codes/decorators/code-process.decorator';
import { NotificationTo } from 'src/verification_codes/decorators/notification-by.decorator';
import { NotificationBy } from 'src/notifications/types/notification-by';

@Controller(TFA_ROUTE)
@ApiTags(TFA_ROUTE)
@UseGuards(JwtAuthGuard)
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly twoFactorAuthManager: TwoFactorAuthManager,
  ) {}

  @Get(TFARoutes.ME)
  async findClientTFA(
    @Client() client: JwtPayload,
  ): Promise<{ data: SelectedTFAFields; message: TFAMessages }> {
    return {
      data: await this.twoFactorAuthService.getOneByAccountID(client.sub),
      message: TFAMessages.FOUND,
    };
  }

  @VerificationCodeProcess(CodeProcess.ENABLE_TFA_EMAIL_FOR_ACCOUNT)
  @NotificationTo(NotificationBy.EMAIL)
  @UseGuards(PasswordsMatch, VerificationCodeAlreadySent)
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
      following_link: TFA_ROUTE + TFARoutes.VERIFY_TFA + code.url_token,
      message: CodeMessages.CODE_SENT_TO_MAIL,
    };
  }

  @VerificationCodeProcess(CodeProcess.ENABLE_TFA_MOBILE_PHONE_FOR_ACCOUNT)
  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @UseGuards(PasswordsMatch, VerificationCodeAlreadySent)
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
      following_link: TFA_ROUTE + TFARoutes.VERIFY_TFA + code.url_token,
      message: CodeMessages.CODE_SENT_TO_PHONE,
    };
  }

  @VerificationCodeProcess(CodeProcess.ENABLE_TFA_MOBILE_PHONE_FOR_ACCOUNT)
  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @UseGuards(PasswordsMatch, VerificationCodeAlreadySent)
  @Post(TFARoutes.DISABLE)
  async disable2FA(
    @Client() client: JwtPayload,
  ): Promise<{ following_link: string; message: CodeMessages }> {
    const code = await this.twoFactorAuthManager.disable(client.sub);

    return {
      following_link: TFA_ROUTE + TFARoutes.VERIFY_TFA + code.url_token,
      message: CodeMessages.SENT,
    };
  }

  @UseGuards(JwtAuthGuard, VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(TFARoutes.VERIFY_TFA + ':token')
  async makeProcessOfCode(
    @Client() client: JwtPayload,
    @VerificationCodeObj() verification_code: VerificationCode,
  ): Promise<{
    data: SelectedTFAFields;
    message: TFAMessages;
  }> {
    const { process } = verification_code;

    if (process.includes('DISABLE_TFA')) {
      const tfa = await this.twoFactorAuthService.getOneByAccountID(client.sub);

      await this.twoFactorAuthService.delete(tfa as TwoFactorAuth);

      return { data: tfa, message: TFAMessages.TFA_DISABLED };
    } else if (process.includes('ENABLE_TFA')) {
      const via =
        process === CodeProcess.ENABLE_TFA_EMAIL_FOR_ACCOUNT
          ? NotificationBy.EMAIL
          : NotificationBy.MOBILE_PHONE;

      const tfa = await this.twoFactorAuthService.create({
        via,
        accountID: client.sub,
      });

      return { data: tfa, message: TFAMessages.TFA_ENABLED };
    } else {
      throw new ForbiddenException();
    }
  }
}
