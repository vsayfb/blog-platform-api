import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { AUTH_ROUTE } from 'src/lib/constants';
import { Client } from '../decorator/client.decorator';
import { AccessTokenDto } from '../request-dto/access-token.dto';
import { LoginDto } from '../response-dto/login.dto';
import { RegisterDto } from '../response-dto/register.dto';
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
    @Body() body: AccessTokenDto,
  ): Promise<{ data: RegisterDto; message: AuthMessages }> {
    return {
      data: await this.googleAuthService.register(body.access_token),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @HttpCode(200)
  @UseGuards(GoogleAuthGuard)
  @Post(AuthRoutes.LOGIN)
  async login(@Client() client: SelectedAccountFields): Promise<{
    data: LoginDto;
    message: AuthMessages;
  }> {
    return {
      data: this.googleAuthService.login(client),
      message: AuthMessages.SUCCESSFUL_LOGIN,
    };
  }
}
