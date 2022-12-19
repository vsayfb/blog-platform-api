import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import {
  CreateAccountWithEmailDto,
  CreateAccountWithPhoneDto,
} from 'src/accounts/dto/create-account.dto';
import { LocalAuthService } from '../services/local-auth.service';
import { RegisterViewDto } from '../dto/register-view.dto';
import { AuthRoutes } from '../enums/auth-routes';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthMessages } from '../enums/auth-messages';
import { AUTH_ROUTE } from 'src/lib/constants';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { IAuthController } from '../interfaces/auth-controller.interface';
import { LoginViewDto } from '../dto/login-view.dto';
import { CodeMessages } from 'src/codes/enums/code-messages';
import {
  BeginVerificationWithEmailDto,
  BeginVerificationWithPhoneDto,
} from '../dto/begin-verification.dto';

@Controller(AUTH_ROUTE)
@ApiTags(AUTH_ROUTE)
export class LocalAuthController implements IAuthController {
  constructor(private readonly localAuthService: LocalAuthService) {}

  @Post(AuthRoutes.REGISTER_WITH_EMAIL)
  async register(
    @Body() createAccountDto: CreateAccountWithEmailDto,
  ): Promise<{ data: RegisterViewDto; message: AuthMessages }> {
    return {
      data: await this.localAuthService.register({
        by: 'mail',
        dto: createAccountDto,
      }),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @Post(AuthRoutes.REGISTER_WITH_MOBILE_PHONE)
  async registerWithMobilePhone(
    @Body() createAccountDto: CreateAccountWithPhoneDto,
  ): Promise<{ data: RegisterViewDto; message: AuthMessages }> {
    return {
      data: await this.localAuthService.register({
        by: 'sms',
        dto: createAccountDto,
      }),
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

  @Post(AuthRoutes.BEGIN_WITH_EMAIL)
  @HttpCode(200)
  async beginEmailVerification(
    @Body() data: BeginVerificationWithEmailDto,
  ): Promise<{ message: string }> {
    await this.localAuthService.beginRegister({
      by: 'mail',
      username: data.username,
      emailOrMobilePhoneNumber: data.email,
    });

    return { message: CodeMessages.CODE_SENT_TO_MAIL };
  }

  @Post(AuthRoutes.BEGIN_WITH_MOBILE_PHONE)
  @HttpCode(200)
  async beginMobilePhoneVerification(
    @Body() data: BeginVerificationWithPhoneDto,
  ): Promise<{ message: string }> {
    await this.localAuthService.beginRegister({
      by: 'sms',
      username: data.username,
      emailOrMobilePhoneNumber: data.phone,
    });

    return { message: CodeMessages.CODE_SENT_TO_PHONE };
  }
}
