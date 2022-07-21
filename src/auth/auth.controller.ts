import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account as AccountEntity } from 'src/accounts/entities/account.entity';
import { AuthService } from './auth.service';
import { AccessToken } from './dto/access-token.dto';
import { RegisterViewDto } from './dto/register-view.dto';
import { AuthRoutes } from './enums/auth-routes';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiOkResponse({ type: AccessToken })
  @HttpCode(200)
  @Post(AuthRoutes.LOGIN)
  async login(
    @Account() account: AccountEntity,
  ): Promise<{ access_token: string }> {
    return this.authService.login(account);
  }

  @ApiCreatedResponse({
    schema: {
      example: {
        account: { username: 'string', image: 'string', id: 'string' },
        access_token: 'string',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'An array of errors.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Post(AuthRoutes.REGISTER)
  async register(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<RegisterViewDto> {
    return await this.authService.register(createAccountDto);
  }

  @ApiBadRequestResponse({
    description: 'Access token size must be 2048 bytes.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        account: { username: 'string', image: 'string', id: 'string' },
        access_token: 'string',
      },
    },
  })
  @HttpCode(200)
  @Post(AuthRoutes.AUTH_GOOGLE)
  async authGoogle(@Body() body: AccessToken): Promise<RegisterViewDto> {
    return await this.authService.googleAuth(body.access_token);
  }
}
