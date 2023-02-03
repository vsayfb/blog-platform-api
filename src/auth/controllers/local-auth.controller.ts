import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Param,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/auth/decorator/client.decorator';
import { LocalAuthService } from '../services/local-auth.service';
import { RegisterDto } from '../response-dto/register.dto';
import { AuthRoutes } from '../enums/auth-routes';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthMessages } from '../enums/auth-messages';
import { LOCAL_AUTH_ROUTE } from 'src/lib/constants';
import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { IAuthController } from '../interfaces/auth-controller.interface';
import { LoginDto } from '../response-dto/login.dto';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { CodeMessages } from 'src/resources/verification_codes/enums/code-messages';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { EnabledEmailFactorFilter } from 'src/resources/tfa/exceptions/enabled-email-factor-filter';
import { EnabledMobilePhoneFactorFilter } from 'src/resources/tfa/exceptions/enabled-mobile-phone-factor-filter';
import { VerificationCodeObj } from 'src/resources/verification_codes/decorators/verification-code.decorator';
import {
  CodeProcess,
  VerificationCode,
} from 'src/resources/verification_codes/entities/code.entity';
import { VerificationTokenDto } from 'src/resources/verification_codes/dto/verification-token.dto';
import { VerificationCodeDto } from 'src/resources/verification_codes/dto/verification-code.dto';
import { TemporaryAccountsService } from 'src/resources/accounts/services/temporary-accounts.service';
import { NotificationTo } from 'src/resources/verification_codes/decorators/notification-by.decorator';
import { VerificationCodeProcess } from 'src/resources/verification_codes/decorators/code-process.decorator';
import { DeleteVerificationCodeInBody } from 'src/resources/verification_codes/interceptors/delete-code-in-body.interceptor';
import { VerificationCodeMatches } from 'src/resources/verification_codes/guards/check-verification-code-matches.guard';
import {
  RegisterWithEmailDto,
  RegisterWithMobilePhoneDto,
} from '../request-dto/register.dto';
import { DeleteTemporaryAccount } from '../interceptors/delete-temp-account.interceptor';

@Controller(LOCAL_AUTH_ROUTE)
@ApiTags(LOCAL_AUTH_ROUTE)
export class LocalAuthController implements IAuthController {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly notificationFactory: NotificationFactory,
    private readonly temporaryAccountsService: TemporaryAccountsService,
  ) {}

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

  @Post(AuthRoutes.VERIFY_REGISTER + ':token')
  @UseGuards(VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  async register(
    @Param() params: VerificationTokenDto,
    @Body() body: VerificationCodeDto,
    @VerificationCodeObj() code: VerificationCode,
  ): Promise<{ data: RegisterDto; message: AuthMessages }> {
    //
    if (!code.process.includes('REGISTER')) {
      throw new ForbiddenException(CodeMessages.INVALID_CODE);
    }

    const tempAccount =
      await this.temporaryAccountsService.getOneByEmailOrMobilePhone(
        code.receiver,
      );

    const registered = await this.localAuthService.register(tempAccount);

    await this.temporaryAccountsService.delete(tempAccount);

    return {
      data: registered,
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @NotificationTo(NotificationBy.EMAIL)
  @VerificationCodeProcess(CodeProcess.REGISTER_WITH_EMAIL)
  @UseInterceptors(DeleteTemporaryAccount)
  @Post(AuthRoutes.REGISTER_WITH_EMAIL)
  async registerWithEmail(@Body() body: RegisterWithEmailDto) {
    await this.temporaryAccountsService.create({ ...body, mobile_phone: null });

    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.EMAIL,
    );

    const code = await notificationFactory.notifyForRegister(
      body.username,
      body.email,
    );

    return {
      following_url: LOCAL_AUTH_ROUTE + AuthRoutes.VERIFY_REGISTER + code.token,
      message: CodeMessages.CODE_SENT_TO_MAIL,
    };
  }

  @NotificationTo(NotificationBy.MOBILE_PHONE)
  @VerificationCodeProcess(CodeProcess.REGISTER_WITH_MOBIL_PHONE)
  @UseInterceptors(DeleteTemporaryAccount)
  @Post(AuthRoutes.REGISTER_WITH_MOBILE_PHONE)
  async registerWithMobilePhone(@Body() body: RegisterWithMobilePhoneDto) {
    await this.temporaryAccountsService.create({ ...body, email: null });

    const notificationFactory = this.notificationFactory.createNotification(
      NotificationBy.MOBILE_PHONE,
    );

    const code = await notificationFactory.notifyForRegister(
      body.username,
      body.mobile_phone,
    );

    return {
      following_url: LOCAL_AUTH_ROUTE + AuthRoutes.VERIFY_REGISTER + code.token,
      message: CodeMessages.CODE_SENT_TO_PHONE,
    };
  }
}
