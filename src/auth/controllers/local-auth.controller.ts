import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { LocalAuthService } from '../services/local-auth.service';
import { AccessToken } from '../dto/access-token.dto';
import { RegisterViewDto } from '../dto/register-view.dto';
import { AuthRoutes } from '../enums/auth-routes';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthMessages } from '../enums/auth-messages';
import { AUTH_ROUTE } from 'src/lib/constants';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { BeginVerificationDto } from '../dto/begin-verification.dto';
import { IAuthController } from '../interfaces/auth-controller.interface';
import { LoginViewDto } from '../dto/login-view.dto';

@Controller(AUTH_ROUTE)
@ApiTags(AUTH_ROUTE)
export class LocalAuthController implements IAuthController {
  constructor(private readonly localAuthService: LocalAuthService) {}

  @Post(AuthRoutes.REGISTER)
  async register(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<{ data: RegisterViewDto; message: AuthMessages }> {
    return {
      data: await this.localAuthService.register(createAccountDto),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post(AuthRoutes.LOGIN)
  async login(@Account() account: SelectedAccountFields): Promise<{
    data: LoginViewDto;
    message: AuthMessages;
  }> {
    return {
      data: this.localAuthService.login(account),
      message: AuthMessages.SUCCESSFUL_LOGIN,
    };
  }

  @Post(AuthRoutes.BEGIN_REGISTER_VERIFICATION)
  @HttpCode(200)
  async beginVerification(
    @Body() data: BeginVerificationDto,
  ): Promise<{ message: string }> {
    return await this.localAuthService.beginRegisterVerification(
      data.username,
      data.email,
    );
  }
}
