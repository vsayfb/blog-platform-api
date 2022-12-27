import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { GOOGLE_AUTH_ROUTE } from 'src/lib/constants';
import { Client } from '../decorator/client.decorator';
import { GoogleAccessTokenDto } from '../request-dto/google-access-token.dto';
import { LoginDto } from '../response-dto/login.dto';
import { RegisterDto } from '../response-dto/register.dto';
import { AuthMessages } from '../enums/auth-messages';
import { AuthRoutes } from '../enums/auth-routes';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { IAuthController } from '../interfaces/auth-controller.interface';
import { GoogleAuthService } from '../services/google-auth.service';
import { EnabledMobilePhoneFactorFilter } from 'src/tfa/exceptions/enabled-mobile-phone-factor-filter';
import { VerifyGoogleUser } from 'src/accounts/guards/verify-google-user.guard';
import { VerifiedGoogleUser } from 'src/accounts/decorators/google-user.decorator';
import { GoogleUserCredentials } from 'src/apis/google/google.service';

@Controller(GOOGLE_AUTH_ROUTE)
@ApiTags(GOOGLE_AUTH_ROUTE)
export class GoogleAuthController implements IAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @HttpCode(200)
  @UseGuards(VerifyGoogleUser)
  @Post(AuthRoutes.REGISTER)
  async register(
    @VerifiedGoogleUser() googleUser: GoogleUserCredentials,
    @Body() body: GoogleAccessTokenDto,
  ): Promise<{ data: RegisterDto; message: AuthMessages }> {
    return {
      data: await this.googleAuthService.register(googleUser),
      message: AuthMessages.SUCCESSFUL_REGISTRATION,
    };
  }

  @HttpCode(200)
  @UseGuards(GoogleAuthGuard)
  @UseFilters(EnabledMobilePhoneFactorFilter)
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
