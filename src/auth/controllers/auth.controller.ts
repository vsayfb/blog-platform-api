import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountsService } from 'src/resources/accounts/services/accounts.service';
import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { AUTH_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { VerificationCodeObj } from 'src/resources/verification_codes/decorators/verification-code.decorator';
import { VerificationCodeDto } from 'src/resources/verification_codes/dto/verification-code.dto';
import { VerificationTokenDto } from 'src/resources/verification_codes/dto/verification-token.dto';
import { VerificationCode } from 'src/resources/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/resources/verification_codes/enums/code-messages';
import { VerificationCodeMatches } from 'src/resources/verification_codes/guards/check-verification-code-matches.guard';
import { DeleteVerificationCodeInBody } from 'src/resources/verification_codes/interceptors/delete-code-in-body.interceptor';
import { AuthFactory } from '../auth.factory';
import { Client } from '../decorator/client.decorator';
import { AuthMessages } from '../enums/auth-messages';
import { AuthRoutes } from '../enums/auth-routes';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller(AUTH_ROUTE)
@ApiTags(AUTH_ROUTE)
export class AuthController {
  constructor(
    private readonly authFactory: AuthFactory,
    private readonly accountsService: AccountsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(AuthRoutes.CLIENT)
  findClient(@Client() client: JwtPayload): JwtPayload {
    return client;
  }

  @UseGuards(VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AuthRoutes.VERIFY_TFA_LOGIN + ':token')
  async verifyTFALogin(
    @VerificationCodeObj() code: VerificationCode,
    @Param() _params: VerificationTokenDto,
    @Body() _body: VerificationCodeDto,
  ): Promise<{
    data: { account: SelectedAccountFields; access_token: string };
    message: AuthMessages;
  }> {
    if (!code.process.includes('LOGIN_TFA')) {
      throw new ForbiddenException(CodeMessages.INVALID_CODE);
    }

    const account =
      await this.accountsService.getCredentialsByUsernameOrEmailOrPhone(
        code.receiver,
      );

    delete account.password;
    delete account.two_factor_auth;
    delete account.email;
    delete account.mobile_phone;

    const authFactory = this.authFactory.createAuth(account.via);

    delete account.via;

    return {
      data: authFactory.login(account),
      message: AuthMessages.SUCCESSFUL_LOGIN,
    };
  }
}
