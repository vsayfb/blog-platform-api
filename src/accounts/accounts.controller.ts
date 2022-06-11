import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from './accounts.service';
import { Account } from './decorator/account.decorator';
import { Account as AccountEntity } from './entities/account.entity';

@Controller({
  path: 'accounts',
})
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findMe(@Account() account: AccountEntity) {
    return account;
  }

  @Get('/is_available_username')
  async isAvailableUsername(@Query('username') username: string) {
    return !(await this.accountsService.getOneByUsername(username));
  }

  @Get('/is_available_email')
  async isAvailableEmail(@Query('email') email: string) {
    return !(await this.accountsService.getOneByEmail(email));
  }

  @Post('begin_verification')
  async beginVerification(@Body() data: { email: string }) {
    return await this.accountsService.beginRegisterVerification(data.email);
  }
}
