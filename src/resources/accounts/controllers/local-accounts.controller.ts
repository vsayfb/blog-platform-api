import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  Patch,
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
import { NotificationBy } from 'src/notifications/types/notification-by';
import { TwoFactorAuth } from 'src/resources/tfa/entities/two-factor-auth.entity';
import { TwoFactorAuthService } from 'src/resources/tfa/services/two-factor-auth.service';
import { VerificationCodeObj } from 'src/resources/verification_codes/decorators/verification-code.decorator';
import { VerificationCodeDto } from 'src/resources/verification_codes/dto/verification-code.dto';
import { VerificationTokenDto } from 'src/resources/verification_codes/dto/verification-token.dto';
import {
  CodeProcess,
  VerificationCode,
} from 'src/resources/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/resources/verification_codes/enums/code-messages';
import { VerificationCodeMatches } from 'src/resources/verification_codes/guards/check-verification-code-matches.guard';
import { DeleteVerificationCodeInBody } from 'src/resources/verification_codes/interceptors/delete-code-in-body.interceptor';
import { Account } from '../entities/account.entity';
import { AccountMessages } from '../enums/account-messages';
import { AccountRoutes } from '../enums/account-routes';
import { IsLocalAccount } from '../guards/is-local-account.guard';
import { NewPasswordDto } from '../request-dto/new-password.dto';
import { AccountsService } from '../services/accounts.service';
import { LocalAccountsService } from '../services/local-accounts.service';
import { Verification } from '../../../lib/interfaces/verification-interface';

@Controller(LOCAL_ACCOUNTS_ROUTE)
@ApiTags(LOCAL_ACCOUNTS_ROUTE)
export class LocalAccountsController implements Verification {
  constructor(
    private readonly localAccountsService: LocalAccountsService,
    private readonly accountsService: AccountsService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  @UseGuards(JwtAuthGuard, IsLocalAccount, VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Patch(AccountRoutes.UPDATE_PASSWORD + ':token')
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

    await this.accountsService.setPassword(account, dto.new_password);

    await this.accountsService.update(account);

    return {
      data: null,
      message: AccountMessages.PASSWORD_UPDATED,
    };
  }

  @UseGuards(JwtAuthGuard, IsLocalAccount, VerificationCodeMatches)
  @UseInterceptors(DeleteVerificationCodeInBody)
  @Post(AccountRoutes.VERIFY_PROCESS + ':token')
  async process(
    @Client() client: JwtPayload,
    @Param() params: VerificationTokenDto,
    @Body() body: VerificationCodeDto,
    @VerificationCodeObj() verification_code: VerificationCode,
  ) {
    const { process } = verification_code;

    const account = (await this.localAccountsService.getOneByID(
      client.sub,
    )) as Account;

    switch (process) {
      case CodeProcess.ADD_EMAIL_TO_ACCOUNT:
        this.accountsService.setEmail(account, verification_code.receiver);

        await this.accountsService.update(account);

        return {
          data: { email: starEmail(verification_code.receiver) },
          message: AccountMessages.EMAIL_ADDED,
        };

      case CodeProcess.ADD_MOBILE_PHONE_TO_ACCOUNT:
        this.accountsService.setMobilePhone(
          account,
          verification_code.receiver,
        );

        await this.accountsService.update(account);

        return {
          data: { mobile_phone: starMobilePhone(verification_code.receiver) },
          message: AccountMessages.MOBILE_PHONE_ADDED,
        };

      case CodeProcess.REMOVE_EMAIL_FROM_ACCOUNT:
        this.accountsService.setEmail(account, null);

        await this.accountsService.update(account);

        const tfa = await this.twoFactorAuthService.getOneByAccountID(
          client.sub,
        );

        if (tfa && tfa.via === NotificationBy.EMAIL) {
          await this.twoFactorAuthService.delete(tfa as TwoFactorAuth);
        }

        return {
          data: { email: null },
          message: AccountMessages.EMAIL_REMOVED,
        };

      case CodeProcess.REMOVE_MOBILE_PHONE_FROM_ACCOUNT:
        this.accountsService.setMobilePhone(account, null);

        await this.accountsService.update(account);

        const TFA = await this.twoFactorAuthService.getOneByAccountID(
          client.sub,
        );

        if (TFA && TFA.via === NotificationBy.MOBILE_PHONE) {
          await this.twoFactorAuthService.delete(TFA as TwoFactorAuth);
        }

        return {
          data: { mobile_phone: null },
          message: AccountMessages.MOBILE_PHONE_REMOVED,
        };

      default:
        throw new ForbiddenException(CodeMessages.INVALID_CODE);
    }
  }
}
