import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Version,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
  register(@Body() createAccountDto: CreateAccountDto) {
    return createAccountDto;
  }
}
