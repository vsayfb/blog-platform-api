import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { AUTH_ROUTE } from 'src/lib/constants';
import { AccessToken } from '../dto/access-token.dto';
import { LoginViewDto } from '../dto/login-view.dto';
import { RegisterViewDto } from '../dto/register-view.dto';
import { AuthMessages } from '../enums/auth-messages';
import { AuthRoutes } from '../enums/auth-routes';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { IAuthController } from '../interfaces/auth-controller.interface';
import { GoogleAuthService } from '../services/google-auth.service';

@Controller(AUTH_ROUTE + AuthRoutes.AUTH_GOOGLE)
@ApiTags(AUTH_ROUTE + AuthRoutes.AUTH_GOOGLE)
export class GoogleAuthController implements IAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @HttpCode(200)
  @Post(AuthRoutes.REGISTER)
  async register(
    @Body() body: AccessToken,
  ): Promise<{ data: RegisterViewDto; message: AuthMessages }> {
    return {
      data: await this.googleAuthService.register(body.access_token),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @HttpCode(200)
  @UseGuards(GoogleAuthGuard)
  @Post(AuthRoutes.LOGIN)
  async login(@Account() account: SelectedAccountFields): Promise<{
    data: LoginViewDto;
    message: AuthMessages;
  }> {
    return {
      data: this.googleAuthService.login(account),
      message: AuthMessages.SUCCESSFUL_LOGIN,
    };
  }
}
