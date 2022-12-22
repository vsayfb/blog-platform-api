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
import { PasswordsMatch } from 'src/accounts/guards/check-passwords-match.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SECURITY_ROUTE } from 'src/lib/constants';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { IDeleteController } from 'src/lib/interfaces/delete-controller.interface';
import { JwtPayload } from 'src/lib/jwt.payload';
import { TFADto } from '../dto/two-factor-auth.dto';
import { TwoFactorAuth } from '../entities/two-factor-auth.entity';
import { SecurityMessages } from '../enums/security-messages';
import { SecurityRoutes } from '../enums/security-routes';
import { TwoFactorAuthService } from '../services/two-factor-auth.service';
import { CodesMatchForCreateMobileTFA } from '../guards/codes-match-for-enable-mobile-tfa.guard';
import { CodesMatchForCreateEmailTFA } from '../guards/codes-match-for-enable-email-tfa.guard';
import { CodeSentForEnableMobileTFA } from '../guards/code-sent-for-enable-mobile-tfa.guard';
import { CodeSentForEnableEmailTFA } from '../guards/code-sent-for-enable-email-tfa.guard';
import { CodeSentForDisableTFA } from '../guards/code-sent-for-disable-tfa.guard';
import { CodesMatchForDisableTFA } from '../guards/codes-match-for-disable-tfa.guard';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { DeleteVerificationCodeInBody } from 'src/codes/interceptors/delete-code-in-body.interceptor';
import { TwoFactorAuthManager } from '../services/two-factor-auth-manager.service';
import { Client } from 'src/auth/decorator/client.decorator';

@Controller(SECURITY_ROUTE + '/2fa')
@ApiTags(SECURITY_ROUTE + '/2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorAuthController
  implements ICreateController, IDeleteController
{
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly twoFactorAuthManager: TwoFactorAuthManager,
  ) {}

  @Get(SecurityRoutes.ME)
  async findClientTFA(@Client() client: JwtPayload) {
    return {
      data: await this.twoFactorAuthService.getOneByAccountID(client.sub),
      message: SecurityMessages.FOUND,
    };
  }

  @Post(SecurityRoutes.CREATE)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @UseGuards(PasswordsMatch, CodesMatchForCreateEmailTFA)
  async create(
    @Client() client: JwtPayload,
    @Body() dto: TFADto,
  ): Promise<{ data: TwoFactorAuth; message: SecurityMessages }> {
    return {
      data: await this.twoFactorAuthService.create({
        via: 'email',
        accountID: client.sub,
      }),
      message: SecurityMessages.ENABLED_2FA,
    };
  }

  @Post(SecurityRoutes.CREATE_MOBILE_PHONE)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @UseGuards(CodesMatchForCreateMobileTFA, PasswordsMatch)
  async createWithMobilePhone(
    @Client() client: JwtPayload,
    @Body() dto: TFADto,
  ) {
    return {
      data: await this.twoFactorAuthService.create({
        via: 'mobile_phone',
        accountID: client.sub,
      }),
      message: SecurityMessages.ENABLED_2FA,
    };
  }

  @UseGuards(CodesMatchForDisableTFA, CanManageData, PasswordsMatch)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Patch(SecurityRoutes.DELETE + ':id')
  async delete(
    @Data() subject: TwoFactorAuth,
  ): Promise<{ id: string; message: SecurityMessages }> {
    return {
      id: await this.twoFactorAuthService.delete({
        subject,
      }),
      message: SecurityMessages.DISABLED_2FA,
    };
  }

  @UseGuards(PasswordsMatch, CodeSentForEnableEmailTFA)
  @Post(SecurityRoutes.ENABLE_WITH_EMAIL_FACTOR)
  async enable2FAWithEmail(@Client() client: JwtPayload) {
    await this.twoFactorAuthManager.enable({
      by: 'email',
      accountID: client.sub,
    });

    return { message: CodeMessages.CODE_SENT_TO_MAIL };
  }

  @UseGuards(PasswordsMatch, CodeSentForEnableMobileTFA)
  @Post(SecurityRoutes.ENABLE_WITH_MOBILE_PHONE)
  async enable2FAWithMobilePhone(@Client() client: JwtPayload) {
    await this.twoFactorAuthManager.enable({
      by: 'mobile_phone',
      accountID: client.sub,
    });

    return { message: CodeMessages.CODE_SENT_TO_PHONE };
  }

  @UseGuards(PasswordsMatch, CodeSentForDisableTFA)
  @Post(SecurityRoutes.DISABLE)
  async disable2FA(@Client() client: JwtPayload) {
    await this.twoFactorAuthManager.disable(client.sub);

    return {
      data: null,
      message: CodeMessages.SENT,
    };
  }
}
