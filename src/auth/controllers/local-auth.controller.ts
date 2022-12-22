import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/auth/decorator/client.decorator';
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
import { TFAEnabledExceptionFilter } from 'src/security/exceptions/tfa-enabled-exception-filter';
import { TFAGuard } from '../guards/tfa.guard';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { TFAAuthDto } from '../dto/tfa-auth.dto';
import { DeleteVerificationCodeInBody } from 'src/codes/interceptors/delete-code-in-body.interceptor';
import { JwtPayload } from 'src/lib/jwt.payload';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CodeSentForMobilePhoneRegister } from '../guards/code-sent-for-phone-register.guard';
import { CodeSentForRegisterEmail } from '../guards/code-sent-for-register-email.guard';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';

@Controller(AUTH_ROUTE)
@ApiTags(AUTH_ROUTE)
export class LocalAuthController implements IAuthController {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly accountsService: AccountsService,
    private readonly notificationFactory: NotificationFactory,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(AuthRoutes.CLIENT)
  findClient(@Client() client: JwtPayload): JwtPayload {
    return client;
  }

  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AuthRoutes.REGISTER_WITH_EMAIL)
  async register(
    @Body() createAccountDto: CreateAccountWithEmailDto,
  ): Promise<{ data: RegisterViewDto; message: AuthMessages }> {
    return {
      data: await this.localAuthService.register(createAccountDto),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AuthRoutes.REGISTER_WITH_MOBILE_PHONE)
  async registerWithMobilePhone(
    @Body() createAccountDto: CreateAccountWithPhoneDto,
  ): Promise<{ data: RegisterViewDto; message: AuthMessages }> {
    return {
      data: await this.localAuthService.register(createAccountDto),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @UseGuards(TFAGuard)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AuthRoutes.VERIFY_LOGIN)
  async verifyLogin(@Body() dto: TFAAuthDto) {
    const account =
      await this.accountsService.getCredentialsByUsernameOrEmailOrPhone(
        dto.username,
      );

    return {
      data: this.localAuthService.login(account),
      message: AuthMessages.SUCCESSFUL_LOGIN,
    };
  }

  @UseGuards(LocalAuthGuard)
  @UseFilters(TFAEnabledExceptionFilter)
  @HttpCode(200)
  @Post(AuthRoutes.LOGIN)
  async login(@Client() client: SelectedAccountFields): Promise<{
    data: LoginViewDto;
    message: AuthMessages;
  }> {
    return {
      data: this.localAuthService.login(client),
      message: AuthMessages.SUCCESSFUL_LOGIN,
    };
  }

  @Post(AuthRoutes.BEGIN_WITH_EMAIL)
  @UseGuards(CodeSentForRegisterEmail)
  @HttpCode(200)
  async beginEmailVerification(
    @Body() data: BeginVerificationWithEmailDto,
  ): Promise<{ message: string }> {
    const notificationFactory =
      this.notificationFactory.createNotification('email');

    await notificationFactory.notifyForRegister(data.username, data.email);

    return { message: CodeMessages.CODE_SENT_TO_MAIL };
  }

  @Post(AuthRoutes.BEGIN_WITH_MOBILE_PHONE)
  @UseGuards(CodeSentForMobilePhoneRegister)
  @HttpCode(200)
  async beginMobilePhoneVerification(
    @Body() data: BeginVerificationWithPhoneDto,
  ): Promise<{ message: string }> {
    const notificationFactory =
      this.notificationFactory.createNotification('mobile_phone');

    await notificationFactory.notifyForRegister(
      data.username,
      data.mobile_phone,
    );

    return { message: CodeMessages.CODE_SENT_TO_PHONE };
  }
}
