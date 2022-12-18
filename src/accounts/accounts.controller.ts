import {
  Body,
  Controller,
  forwardRef,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Patch,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ACCOUNTS_ROUTE } from 'src/lib/constants';
import { IFindController } from 'src/lib/interfaces/find-controller.interface';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountsService } from './services/accounts.service';
import { Account } from './decorator/account.decorator';
import { EmailQueryDto } from './dto/email-query.dto';
import { UsernameQuery } from './dto/username-query.dto';
import { AccountMessages } from './enums/account-messages';
import { AccountRoutes } from './enums/account-routes';
import { SelectedAccountFields } from './types/selected-account-fields';
import { IUpdateController } from 'src/lib/interfaces/update-controller.interface';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account as AccountEntity } from './entities/account.entity';
import { LoginViewDto } from 'src/auth/dto/login-view.dto';
import { SignNewJwtToken } from './interceptors/sign-new-jwt.interceptor';

@Controller(ACCOUNTS_ROUTE)
@ApiTags(ACCOUNTS_ROUTE)
export class AccountsController implements IUpdateController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(AccountRoutes.CLIENT)
  findClient(@Account() account: JwtPayload): JwtPayload {
    return account;
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @UseInterceptors(SignNewJwtToken)
  @Put(AccountRoutes.UPDATE + ':id')
  async update(
    @Body() updateDto: UpdateAccountDto,
    @Data() subject: AccountEntity,
  ): Promise<{
    data: LoginViewDto;
    message: AccountMessages;
  }> {
    return {
      data: (await this.accountsService.update(subject, updateDto)) as any,
      message: AccountMessages.UPDATED,
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
}
