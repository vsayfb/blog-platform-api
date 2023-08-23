import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ACCOUNTS_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountsService } from '../services/accounts.service';
import { AccountMessages } from '../enums/account-messages';
import { AccountRoutes } from '../enums/account-routes';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { Account as AccountEntity } from '../entities/account.entity';
import { SignNewJwtToken } from '../interceptors/sign-new-jwt.interceptor';
import { starEmail, starMobilePhone } from 'src/lib/star-text';
import { Client } from 'src/auth/decorator/client.decorator';
import { UsernameDto } from '../request-dto/username.dto';
import { EmailDto } from '../request-dto/email.dto';
import { UniqueUsernameDto } from '../request-dto/unique-username.dto';
import { LoginDto } from 'src/auth/response-dto/login.dto';
import { ClientAccountDto } from '../response-dto/client-account.dto';
import { FoundUserDto } from '../response-dto/found-user.dto';
import { CachePersonalJSON } from 'src/cache/interceptors/cache-personal-json.interceptor';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller(ACCOUNTS_ROUTE)
@ApiTags(ACCOUNTS_ROUTE)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @CacheTTL(300)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CachePersonalJSON)
  @Get(AccountRoutes.CLIENT)
  async findClient(@Client() client: JwtPayload): Promise<{
    data: ClientAccountDto;
    message: AccountMessages;
  }> {
    const account = await this.accountsService.getCredentialsByID(client.sub);

    delete account.password;

    if (account.email) {
      account.email = starEmail(account.email);
    }

    if (account.mobile_phone) {
      account.mobile_phone = starMobilePhone(account.mobile_phone);
    }

    return {
      data: account as unknown as ClientAccountDto,
      message: AccountMessages.FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @UseInterceptors(SignNewJwtToken)
  @Patch(AccountRoutes.UPDATE_USERNAME + ':id')
  async updateUsername(
    @Data() subject: AccountEntity,
    @Body() updateDto: UniqueUsernameDto,
  ): Promise<{
    data: LoginDto;
    message: AccountMessages;
  }> {
    this.accountsService.setUsername(subject, updateDto.username);

    const data = await this.accountsService.update(subject);

    return {
      data: data as unknown as LoginDto,
      message: AccountMessages.UPDATED,
    };
  }

  @Get(AccountRoutes.SEARCH_BY_USERNAME)
  @UseGuards(JwtAuthGuard)
  async searchByUsername(
    @Query() { username }: UsernameDto,
  ): Promise<{ data: FoundUserDto[]; message: AccountMessages }> {
    return {
      data: await this.accountsService.searchByUsername(username),
      message: AccountMessages.FOUND_BY_USERNAME,
    };
  }

  @Get(AccountRoutes.IS_AVAILABLE_USERNAME)
  async isAvailableUsername(
    @Query() { username }: UsernameDto,
  ): Promise<{ data: boolean; message: string }> {
    const account = await this.accountsService.getOneByUsername(username);

    if (account)
      return { data: false, message: AccountMessages.USERNAME_TAKEN };

    return { data: true, message: AccountMessages.USERNAME_AVAILABLE };
  }

  @Get(AccountRoutes.IS_AVAILABLE_EMAIL)
  async isAvailableEmail(
    @Query() { email }: EmailDto,
  ): Promise<{ data: boolean; message: string }> {
    const account = await this.accountsService.getOneByEmail(email);

    if (account) return { data: false, message: AccountMessages.EMAIL_TAKEN };

    return { data: true, message: AccountMessages.EMAIL_AVAILABLE };
  }
}
