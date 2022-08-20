import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account as AccountEntity } from 'src/accounts/entities/account.entity';
import { AuthService } from './auth.service';
import { AccessToken } from './dto/access-token.dto';
import { RegisterViewDto } from './dto/register-view.dto';
import { AuthRoutes } from './enums/auth-routes';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthMessages } from './enums/auth-messages';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiOkResponse({ type: AccessToken })
  @HttpCode(200)
  @Post(AuthRoutes.LOGIN)
  login(@Account() account: AccountEntity): {
    data: { access_token: string };
    message: AuthMessages;
  } {
    return {
      data: this.authService.login(account),
      message: AuthMessages.SUCCESSFUL_LOGIN,
    };
  }

  @Post(AuthRoutes.REGISTER)
  async register(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<{ data: RegisterViewDto; message: AuthMessages }> {
    return {
      data: await this.authService.register(createAccountDto),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @HttpCode(200)
  @Post(AuthRoutes.AUTH_GOOGLE)
  async authGoogle(
    @Body() body: AccessToken,
  ): Promise<{ data: RegisterViewDto; message: AuthMessages }> {
    return {
      data: await this.authService.googleAuth(body.access_token),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }
}
