import {
  Controller,
  Post,
  Body,
  UseGuards,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiResponse,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { RegisterViewDto } from 'src/accounts/dto/register-view.dto';
import { Account as AccountEntity } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { AuthService } from './auth.service';
import { AccessToken } from './dto/access-token.dto';

@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @ApiOkResponse({ type: AccessToken })
  @HttpCode(200)
  @Post('login')
  login(@Account() account: AccountEntity): { access_token: string } {
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
  @Post('register')
  register(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<
    { account: RegisterViewDto; access_token: string } | ForbiddenException
  > {
    return this.authService.register(createAccountDto);
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
  @Post('google')
  authGoogle(
    @Body() body: AccessToken,
  ): Promise<{ account: RegisterViewDto; access_token: string }> {
    return this.authService.googleAuth(body.access_token);
  }
}
