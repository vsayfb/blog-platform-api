import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from './accounts.service';

@Controller({
  path: 'accounts',
})
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() request: any) {
    return request.user;
  }
}
