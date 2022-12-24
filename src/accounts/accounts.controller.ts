import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ACCOUNTS_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountsService } from './services/accounts.service';
import { EmailQueryDto } from './dto/email-query.dto';
import { UsernameQuery } from './dto/username-query.dto';
import { AccountMessages } from './enums/account-messages';
import { AccountRoutes } from './enums/account-routes';
import { SelectedAccountFields } from './types/selected-account-fields';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { Account as AccountEntity } from './entities/account.entity';
import { LoginViewDto } from 'src/auth/dto/login-view.dto';
import { SignNewJwtToken } from './interceptors/sign-new-jwt.interceptor';
import { starEmail, starMobilePhone } from 'src/lib/star-text';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { Client } from 'src/auth/decorator/client.decorator';

@Controller(ACCOUNTS_ROUTE)
@ApiTags(ACCOUNTS_ROUTE)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get(AccountRoutes.CLIENT)
  @UseGuards(JwtAuthGuard)
  async findClient(@Client() client: JwtPayload): Promise<{
    data: SelectedAccountFields & {
      mobil_phone: string | null;
      email: string | null;
    };
    message: AccountMessages;
  }> {
    const account = await this.accountsService.getCredentials(client.sub);

    delete account.password;

    if (account.email) {
      account.email = starEmail(account.email);
    }

    if (account.mobile_phone) {
      account.mobile_phone = starMobilePhone(account.mobile_phone);
    }

    return {
      data: account as unknown as SelectedAccountFields & {
        mobil_phone: string | null;
        email: string | null;
      },
      message: AccountMessages.FOUND,
    };
  }

  @Get(AccountRoutes.SEARCH_BY_USERNAME)
  @UseGuards(JwtAuthGuard)
  async searchByUsername(
    @Query() { username }: UsernameQuery,
  ): Promise<{ data: SelectedAccountFields[]; message: AccountMessages }> {
    return {
      data: await this.accountsService.searchByUsername(username),
      message: AccountMessages.FOUND_BY_USERNAME,
    };
  }

  @Get(AccountRoutes.IS_AVAILABLE_USERNAME)
  async isAvailableUsername(
    @Query() { username }: UsernameQuery,
  ): Promise<{ data: boolean; message: string }> {
    const account = await this.accountsService.getOneByUsername(username);

    if (account)
      return { data: false, message: AccountMessages.USERNAME_TAKEN };

    return { data: true, message: AccountMessages.USERNAME_AVAILABLE };
  }

  @Get(AccountRoutes.IS_AVAILABLE_EMAIL)
  async isAvailableEmail(
    @Query() { email }: EmailQueryDto,
  ): Promise<{ data: boolean; message: string }> {
    const account = await this.accountsService.getOneByUsername(email);

    if (account) return { data: false, message: AccountMessages.EMAIL_TAKEN };

    return { data: true, message: AccountMessages.EMAIL_AVAILABLE };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @UseInterceptors(SignNewJwtToken)
  @Patch(AccountRoutes.UPDATE_USERNAME + ':id')
  async updateUsername(
    @Data() subject: AccountEntity,
    @Body() updateDto: UpdateUsernameDto,
  ): Promise<{
    data: LoginViewDto;
    message: AccountMessages;
  }> {
    return {
      data: (await this.accountsService.update(subject, updateDto)) as any,
      message: AccountMessages.UPDATED,
    };
  }
}