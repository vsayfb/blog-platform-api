import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { IAuthService } from '../interfaces/auth-service.interface';
import { BaseAuthService } from './base-auth.service';
import { MailsService } from 'src/mails/mails.service';
import { RegisterViewDto } from '../dto/register-view.dto';

@Injectable()
export class LocalAuthService extends BaseAuthService implements IAuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly codesService: CodesService,
    private readonly mailsService: MailsService,
  ) {
    super();
  }

  async register(data: CreateAccountDto): Promise<RegisterViewDto> {
    const code = await this.codesService.getCode(data.verification_code);

    if (!code) throw new ForbiddenException(CodeMessages.INVALID_CODE);

    if (code.receiver !== data.email)
      throw new ForbiddenException(AccountMessages.INVALID_EMAIL);

    const account = await this.accountsService.create(data);

    return this.login(account);
  }

  async validateAccount(
    username: string,
    pass: string,
  ): Promise<SelectedAccountFields> | null {
    const account = await this.accountsService.getAccount(username);

    const passwordsMatch = account
      ? await this.passwordManagerService.comparePassword(
          pass,
          account.password,
        )
      : false;

    if (passwordsMatch) {
      delete account.password;
      delete account.email;

      return account;
    }

    return null;
  }

  async beginRegisterVerification(username: string, email: string) {
    const emailTaken = await this.accountsService.getOneByEmail(email);

    if (emailTaken) throw new ForbiddenException(AccountMessages.EMAIL_TAKEN);

    const usernameTaken = await this.accountsService.getOneByUsername(username);

    if (usernameTaken)
      throw new ForbiddenException(AccountMessages.USERNAME_TAKEN);

    return await this.mailsService.sendVerificationCodeMail({ username, email });
  }
}
