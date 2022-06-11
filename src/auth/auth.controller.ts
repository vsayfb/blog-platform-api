import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account as AccountEntity } from 'src/accounts/entities/account.entity';
import { AuthService } from './auth.service';
import { AccessToken } from './dto/access-token.dto';

@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Account() account: AccountEntity) {
    return this.authService.login(account);
  }

  @Post('register')
  @ApiResponse({
    description: 'The account has been successfully created.',
    type: CreateAccountDto,
  })
  @ApiCreatedResponse({})
  register(@Body() createAccountDto: CreateAccountDto) {
    return this.authService.register(createAccountDto);
  }

  @Post('google')
  authGoogle(@Body() body: AccessToken) {
    return this.authService.googleAuth(body.access_token);
  }
}
