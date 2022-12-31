import {
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountCredentials } from 'src/accounts/decorators/account.decorator';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { IsGoogleAccount } from 'src/accounts/guards/is-google-account.guard';
import { PasswordsMatch } from 'src/accounts/guards/passwords-match.guard';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';
import { Client } from 'src/auth/decorator/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ACCOUNT_TFA, GOOGLE_ACCOUNT_TFA, TFA_ROUTE } from 'src/lib/constants';
import { FollowingLink } from 'src/lib/decorators/following-link.decorator';
import { JwtPayload } from 'src/lib/jwt.payload';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { VerificationCodeProcess } from 'src/verification_codes/decorators/code-process.decorator';
import { NotificationTo } from 'src/verification_codes/decorators/notification-by.decorator';
import { VerificationCodeObj } from 'src/verification_codes/decorators/verification-code.decorator';
import {
  CodeProcess,
  VerificationCode,
} from 'src/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { VerificationCodeMatches } from 'src/verification_codes/guards/check-verification-code-matches.guard';
import { VerificationCodeAlreadySentToAccount } from 'src/verification_codes/guards/code-already-sent.guard';
import { DeleteVerificationCodeInBody } from 'src/verification_codes/interceptors/delete-code-in-body.interceptor';
import { TFAMessages } from '../enums/tfa-messages';
import { TFARoutes } from '../enums/tfa-routes';
import { TwoFactorAuthManager } from '../services/two-factor-auth-manager.service';
import { TwoFactorAuthService } from '../services/two-factor-auth.service';
import { SelectedTFAFields } from '../types/selected-tfa';

@Controller(GOOGLE_ACCOUNT_TFA)
@ApiTags(GOOGLE_ACCOUNT_TFA)
@UseGuards(JwtAuthGuard, IsGoogleAccount)
export class GoogleAccountTFAController {
  constructor(
    private readonly twoFactorAuthManager: TwoFactorAuthManager,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  @VerificationCodeProcess(CodeProcess.ENABLE_TFA_MOBILE_PHONE_FACTOR)
  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @FollowingLink(GOOGLE_ACCOUNT_TFA + TFARoutes.CREATE)
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
      following_link: GOOGLE_ACCOUNT_TFA + TFARoutes.CREATE + code.token,
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
      const tfa = await this.twoFactorAuthService.create({
        via: NotificationBy.MOBILE_PHONE,
        accountID: client.sub,
      });

      return { data: tfa, message: TFAMessages.TFA_ENABLED };
    }
  }
}
