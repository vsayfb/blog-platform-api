import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  Post,
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
import { SelectedAccountFields } from '../types/selected-account-fields';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { Account, Account as AccountEntity } from '../entities/account.entity';
import { SignNewJwtToken } from '../interceptors/sign-new-jwt.interceptor';
import { starEmail, starMobilePhone } from 'src/lib/star-text';
import { Client } from 'src/auth/decorator/client.decorator';
import { NotificationFactory } from 'src/notifications/services/notification-factory.service';
import { DeleteVerificationCodeInBody } from 'src/verification_codes/interceptors/delete-code-in-body.interceptor';
import { UsernameDto } from '../request-dto/username.dto';
import { EmailDto } from '../request-dto/email.dto';
import { UniqueUsernameDto } from '../request-dto/unique-username.dto';
import { LoginDto } from 'src/auth/response-dto/login.dto';
import { VerificationCodeMatches } from '../../verification_codes/guards/check-verification-code-matches.guard';
import { ClientAccountDto } from '../response-dto/client-account.dto';
import { FoundUserDto } from '../response-dto/found-user.dto';
import { VerificationCodeObj } from 'src/verification_codes/decorators/verification-code.decorator';
import {
  CodeProcess,
  VerificationCode,
} from 'src/verification_codes/entities/code.entity';
import { NewPasswordDto } from '../request-dto/new-password.dto';

@Controller(ACCOUNTS_ROUTE)
@ApiTags(ACCOUNTS_ROUTE)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get(AccountRoutes.CLIENT)
  @UseGuards(JwtAuthGuard)
  async findClient(@Client() client: JwtPayload): Promise<{
    data: ClientAccountDto;
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
    return {
      data: (await this.accountsService.update(subject, updateDto)) as any,
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
    const account = await this.accountsService.getOneByUsername(email);

    if (account) return { data: false, message: AccountMessages.EMAIL_TAKEN };

    return { data: true, message: AccountMessages.EMAIL_AVAILABLE };
  }

  @UseGuards(JwtAuthGuard, VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AccountRoutes.VERIFY_PROCESS + ':token')
  async makeProcessOfCode(
    @Client() client: JwtPayload,
    @VerificationCodeObj() verification_code: VerificationCode,
  ) {
    const { process } = verification_code;

    const account = await this.accountsService.getOneByID(client.sub);

    switch (process) {
      case CodeProcess.ADD_EMAIL_TO_ACCOUNT:
        await this.accountsService.update(account as Account, {
          email: verification_code.receiver,
        });
        return {
          data: { email: starEmail(verification_code.receiver) },
          message: AccountMessages.EMAIL_ADDED,
        };
      case CodeProcess.REMOVE_EMAIL_FROM_ACCOUNT:
        await this.accountsService.update(account as Account, {
          email: null,
        });
        return {
          data: { email: null },
          message: AccountMessages.EMAIL_REMOVED,
        };
      case CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT:
        await this.accountsService.update(account as Account, {
          mobile_phone: verification_code.receiver,
        });
        return {
          data: { mobile_phone: starMobilePhone(verification_code.receiver) },
          message: AccountMessages.PHONE_ADDED,
        };
      case CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT:
        await this.accountsService.update(account as Account, {
          mobile_phone: null,
        });
        return {
          data: { mobile_phone: null },
          message: AccountMessages.PHONE_REMOVED,
        };
      default:
        throw new ForbiddenException();
    }
  }

  @UseGuards(JwtAuthGuard, VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AccountRoutes.UPDATE_PASSWORD + ':token')
  async updatePassword(
    @Client() client: JwtPayload,
    @VerificationCodeObj() verification_code: VerificationCode,
    @Body() dto: NewPasswordDto,
  ) {
    if (verification_code.process !== CodeProcess.UPDATE_PASSWORD) {
      throw new ForbiddenException();
    }

    const account = (await this.accountsService.getOneByID(
      client.sub,
    )) as Account;

    await this.accountsService.update(account, { password: dto.new_password });

    return {
      data: null,
      message: AccountMessages.PASSWORD_UPDATED,
    };
  }
}
