import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PasswordsMatch } from 'src/resources/accounts/guards/passwords-match.guard';
import { Client } from 'src/auth/decorator/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ACCOUNT_TFA, TFA_ROUTE } from 'src/lib/constants';
import { FollowingLink } from 'src/lib/decorators/following-link.decorator';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { JwtPayload } from 'src/lib/jwt.payload';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { VerificationCodeObj } from 'src/resources/verification_codes/decorators/verification-code.decorator';
import { VerificationCodeDto } from 'src/resources/verification_codes/dto/verification-code.dto';
import { VerificationTokenDto } from 'src/resources/verification_codes/dto/verification-token.dto';
import { VerificationCode } from 'src/resources/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/resources/verification_codes/enums/code-messages';
import { VerificationCodeMatches } from 'src/resources/verification_codes/guards/check-verification-code-matches.guard';
import { DeleteVerificationCodeInBody } from 'src/resources/verification_codes/interceptors/delete-code-in-body.interceptor';
import { TwoFactorAuth } from '../entities/two-factor-auth.entity';
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

  @FollowingLink(ACCOUNT_TFA + TFARoutes.DELETE)
  @UseGuards(PasswordsMatch, CodeAlreadySentForDisableTFA)
  @Post(TFARoutes.DISABLE)
  async disable2FA(
    @Client() client: JwtPayload,
  ): Promise<{ following_link: string; message: string }> {
    const code = await this.twoFactorAuthManager.disable(client.sub);

    const tfa = await this.twoFactorAuthService.getOneByAccountID(client.sub);

    const codeSentTo =
      tfa.via === NotificationBy.EMAIL ? 'email' : 'mobile phone';

    return {
      following_link: ACCOUNT_TFA + TFARoutes.DELETE + code.token,
      message: CodeMessages.SENT + 'to your ' + codeSentTo,
    };
  }

  @UseGuards(JwtAuthGuard, VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(TFARoutes.DELETE + ':token')
  async delete(
    @Client() client: JwtPayload,
    @VerificationCodeObj() code: VerificationCode,
    @Param() token: VerificationTokenDto,
    @Body() body: VerificationCodeDto,
  ) {
    if (!code.process.includes('DISABLE_TFA')) {
      throw new ForbiddenException(CodeMessages.INVALID_CODE);
    }

    const tfa = await this.twoFactorAuthService.getOneByAccountID(client.sub);

    await this.twoFactorAuthService.delete(tfa as TwoFactorAuth);

    return { data: null, message: TFAMessages.TFA_DISABLED };
  }
}
