import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/auth/decorator/client.decorator';
import {
  CreateAccountWithEmailDto,
  CreateAccountWithMobilePhoneDto,
} from 'src/accounts/request-dto/create-account.dto';
import { LocalAuthService } from '../services/local-auth.service';
import { RegisterDto } from '../response-dto/register.dto';
import { AuthRoutes } from '../enums/auth-routes';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthMessages } from '../enums/auth-messages';
import { LOCAL_AUTH_ROUTE } from 'src/lib/constants';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { IAuthController } from '../interfaces/auth-controller.interface';
import { LoginDto } from '../response-dto/login.dto';
import {
  BeginVerificationWithEmailDto,
  BeginVerificationWithPhoneDto,
} from '../request-dto/begin-verification.dto';
import { CodeSentForMobilePhoneRegister } from '../guards/code-sent-for-phone-register.guard';
import { CodeSentForRegisterEmail } from '../guards/code-sent-for-register-email.guard';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { DeleteVerificationCodeInBody } from 'src/verification_codes/interceptors/delete-code-in-body.interceptor';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { EnabledEmailFactorException } from 'src/tfa/exceptions/enabled-email-factor.exception';
import { EnabledMobilePhoneFactorException } from 'src/tfa/exceptions/enabled-mobile-phone-factor.exception';
import { EnabledEmailFactorFilter } from 'src/tfa/exceptions/enabled-email-factor-filter';
import { EnabledMobilePhoneFactorFilter } from 'src/tfa/exceptions/enabled-mobile-phone-factor-filter';

@Controller(LOCAL_AUTH_ROUTE)
@ApiTags(LOCAL_AUTH_ROUTE)
export class LocalAuthController implements IAuthController {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly notificationFactory: NotificationFactory,
  ) {}

  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AuthRoutes.REGISTER_WITH_EMAIL)
  async register(
    @Body() createAccountDto: CreateAccountWithEmailDto,
  ): Promise<{ data: RegisterDto; message: AuthMessages }> {
    return {
      data: await this.localAuthService.register(createAccountDto),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AuthRoutes.REGISTER_WITH_MOBILE_PHONE)
  async registerWithMobilePhone(
    @Body() createAccountDto: CreateAccountWithMobilePhoneDto,
  ): Promise<{ data: RegisterDto; message: AuthMessages }> {
    return {
      data: await this.localAuthService.register(createAccountDto),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @UseGuards(LocalAuthGuard)
  @UseFilters(EnabledEmailFactorFilter, EnabledMobilePhoneFactorFilter)
  @HttpCode(200)
  @Post(AuthRoutes.LOGIN)
  async login(@Client() client: SelectedAccountFields): Promise<{
    data: LoginDto;
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
  ): Promise<{ message: CodeMessages }> {
    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.EMAIL,
    );

    await notificationFactory.notifyForRegister(data.username, data.email);

    return { message: CodeMessages.CODE_SENT_TO_MAIL };
  }

  @Post(AuthRoutes.BEGIN_WITH_MOBILE_PHONE)
  @UseGuards(CodeSentForMobilePhoneRegister)
  @HttpCode(200)
  async beginMobilePhoneVerification(
    @Body() data: BeginVerificationWithPhoneDto,
  ): Promise<{ message: CodeMessages }> {
    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.MOBILE_PHONE,
    );

    await notificationFactory.notifyForRegister(
      data.username,
      data.mobile_phone,
    );

    return { message: CodeMessages.CODE_SENT_TO_PHONE };
  }
}
