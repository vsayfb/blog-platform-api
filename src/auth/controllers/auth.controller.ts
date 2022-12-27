import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountCredentials } from 'src/accounts/decorators/account.decorator';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { AUTH_ROUTE, TFA_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { VerificationTokenDto } from 'src/verification_codes/dto/verification-token.dto';
import { VerificationCode } from 'src/verification_codes/entities/code.entity';
import { DeleteVerificationCodeInBody } from 'src/verification_codes/interceptors/delete-code-in-body.interceptor';
import { AuthFactory } from '../auth.factory';
import { Client } from '../decorator/client.decorator';
import { AuthMessages } from '../enums/auth-messages';
import { AuthRoutes } from '../enums/auth-routes';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TFAGuard } from '../guards/tfa.guard';

@Controller(AUTH_ROUTE)
@ApiTags(AUTH_ROUTE)
export class AuthController {
  constructor(private readonly authFactory: AuthFactory) {}

  @UseGuards(JwtAuthGuard)
  @Get(AuthRoutes.CLIENT)
  findClient(@Client() client: JwtPayload): JwtPayload {
    return client;
  }

  @UseGuards(TFAGuard)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AuthRoutes.VERIFY_LOGIN + ':token')
  async verifyLogin(
    @Param() params: VerificationTokenDto,
    @Body() body: VerificationCode,
    @AccountCredentials() account: AccountWithCredentials,
  ): Promise<{
    data: { account: SelectedAccountFields; access_token: string };
    message: AuthMessages;
  }> {
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
