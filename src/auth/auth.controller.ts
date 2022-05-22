import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { AuthService } from './auth.service';

@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() request: any) {
    return this.authService.login(request.user);
  }

  @Post('register')
  @ApiResponse({
    description: 'The record has been successfully created.',
    type: CreateAccountDto,
  })
  @ApiCreatedResponse({})
  register(@Body() createAccountDto: CreateAccountDto) {
    return createAccountDto;
  }
}
