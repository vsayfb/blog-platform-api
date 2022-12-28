import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/auth/decorator/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LOCAL_ACCOUNTS_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { starEmail, starMobilePhone } from 'src/lib/star-text';
import { VerificationCodeObj } from 'src/verification_codes/decorators/verification-code.decorator';
import { VerificationCodeDto } from 'src/verification_codes/dto/verification-code.dto';
import { VerificationTokenDto } from 'src/verification_codes/dto/verification-token.dto';
import {
  CodeProcess,
  VerificationCode,
} from 'src/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { VerificationCodeMatches } from 'src/verification_codes/guards/check-verification-code-matches.guard';
import { DeleteVerificationCodeInBody } from 'src/verification_codes/interceptors/delete-code-in-body.interceptor';
import { Account } from '../entities/account.entity';
import { AccountMessages } from '../enums/account-messages';
import { AccountRoutes } from '../enums/account-routes';
import { IsLocalAccount } from '../guards/is-local-account.guard';
import { NewPasswordDto } from '../request-dto/new-password.dto';
import { AccountsService } from '../services/accounts.service';
import { LocalAccountsService } from '../services/local-accounts.service';

@Controller(LOCAL_ACCOUNTS_ROUTE)
@ApiTags(LOCAL_ACCOUNTS_ROUTE)
export class LocalAccountsController {
  constructor(
    private readonly localAccountsService: LocalAccountsService,
    private readonly accountsService: AccountsService,
  ) {}

  @UseGuards(JwtAuthGuard, IsLocalAccount, VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AccountRoutes.VERIFY_PROCESS + ':token')
  async makeProcessOfCode(
    @Client() client: JwtPayload,
    @Param() params: VerificationTokenDto,
    @Body() body: VerificationCodeDto,
    @VerificationCodeObj() verification_code: VerificationCode,
  ) {
    const { process } = verification_code;

    const account = await this.localAccountsService.getOneByID(client.sub);

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
        throw new ForbiddenException(CodeMessages.INVALID_CODE);
    }
  }

  @UseGuards(JwtAuthGuard, IsLocalAccount, VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AccountRoutes.UPDATE_PASSWORD + ':token')
  async updatePassword(
    @Client() client: JwtPayload,
    @Param() params: VerificationTokenDto,
    @VerificationCodeObj() verification_code: VerificationCode,
    @Body() dto: NewPasswordDto,
  ) {
    if (verification_code.process !== CodeProcess.UPDATE_PASSWORD) {
      throw new ForbiddenException(CodeMessages.INVALID_CODE);
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
