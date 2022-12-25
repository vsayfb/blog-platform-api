import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
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
import { CodeSentForEnableMobileTFA } from '../guards/code-sent-for-enable-mobile-tfa.guard';
import { CodeSentForEnableEmailTFA } from '../guards/code-sent-for-enable-email-tfa.guard';
import { CodeSentForDisableTFA } from '../guards/code-sent-for-disable-tfa.guard';
import { TwoFactorAuthManager } from '../services/two-factor-auth-manager.service';
import { Client } from 'src/auth/decorator/client.decorator';
import { VerifyTFAProcess } from '../guards/verify-tfa-process.guard';
import { VerificationCode } from 'src/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { DeleteVerificationCodeInBody } from 'src/verification_codes/interceptors/delete-code-in-body.interceptor';
import { SelectedTFAFields } from '../types/selected-tfa';
import { VerificationCodeObj } from 'src/verification_codes/decorators/verification-code.decorator';
import { PasswordsMatch } from 'src/accounts/guards/passwords-match.guard';

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

  @UseGuards(PasswordsMatch, CodeSentForEnableEmailTFA)
  @Post(TFARoutes.ENABLE_WITH_EMAIL_FACTOR)
  async enable2FAWithEmail(
    @Client() client: JwtPayload,
  ): Promise<{ following_link: string; message: CodeMessages }> {
    const code = await this.twoFactorAuthManager.enable({
      by: 'email',
      accountID: client.sub,
    });

    return {
      following_link: TFA_ROUTE + TFARoutes.VERIFY_TFA + code.url_token,
      message: CodeMessages.CODE_SENT_TO_MAIL,
    };
  }

  @UseGuards(PasswordsMatch, CodeSentForEnableMobileTFA)
  @Post(TFARoutes.ENABLE_WITH_MOBILE_PHONE)
  async enable2FAWithMobilePhone(
    @Client() client: JwtPayload,
  ): Promise<{ following_link: string; message: CodeMessages }> {
    const code = await this.twoFactorAuthManager.enable({
      by: 'mobile_phone',
      accountID: client.sub,
    });

    return {
      following_link: TFA_ROUTE + TFARoutes.VERIFY_TFA + code.url_token,
      message: CodeMessages.CODE_SENT_TO_PHONE,
    };
  }

  @UseGuards(PasswordsMatch, CodeSentForDisableTFA)
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

  @UseGuards(JwtAuthGuard, VerifyTFAProcess)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(TFARoutes.VERIFY_TFA + ':token')
  async verifyProcess(
    @Client() client: JwtPayload,
    @VerificationCodeObj() verification_code: VerificationCode,
  ): Promise<{
    data: SelectedTFAFields;
    message: TFAMessages;
  }> {
    const { process } = verification_code;

    if (process.includes('disable_tfa')) {
      const tfa = await this.twoFactorAuthService.getOneByAccountID(client.sub);

      await this.twoFactorAuthService.delete(tfa as TwoFactorAuth);

      return { data: tfa, message: TFAMessages.TFA_DISABLED };
    }
    if (process.includes('enable_tfa')) {
      const via = process.includes('email') ? 'email' : 'mobile_phone';

      const tfa = await this.twoFactorAuthService.create({
        via,
        accountID: client.sub,
      });

      return { data: tfa, message: TFAMessages.TFA_ENABLED };
    }
  }
}
