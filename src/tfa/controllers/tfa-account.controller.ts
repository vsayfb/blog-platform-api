import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PasswordsMatch } from 'src/accounts/guards/passwords-match.guard';
import { Client } from 'src/auth/decorator/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ACCOUNTS_ROUTE, ACCOUNT_TFA, TFA_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { VerificationCodeAlreadySent } from 'src/verification_codes/guards/code-already-sent.guard';
import { TFAMessages } from '../enums/tfa-messages';
import { TFARoutes } from '../enums/tfa-routes';
import { CodeAlreadySentForDisableTFA } from '../guards/code-sent-for-disable-tfa.guard';
import { TwoFactorAuthManager } from '../services/two-factor-auth-manager.service';
import { TwoFactorAuthService } from '../services/two-factor-auth.service';
import { SelectedTFAFields } from '../types/selected-tfa';

@Controller(ACCOUNT_TFA)
@ApiTags(ACCOUNT_TFA)
@UseGuards(JwtAuthGuard)
export class AccountTFAController {
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

  @UseGuards(PasswordsMatch, CodeAlreadySentForDisableTFA)
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
}
