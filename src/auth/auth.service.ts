import { GoogleService } from 'src/apis/google/google.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from 'src/accounts/accounts.service';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { ProcessEnv } from 'src/lib/enums/env';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { RegisterViewDto } from './dto/register-view.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly googleService: GoogleService,
    private readonly configService: ConfigService,
    private readonly codesService: CodesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: CreateAccountDto): Promise<RegisterViewDto> {
    const code = await this.codesService.getCode(data.verification_code);

    if (!code) throw new ForbiddenException(CodeMessages.INVALID_CODE);

    if (code.receiver !== data.email) {
      throw new ForbiddenException(AccountMessages.INVALID_EMAIL);
    }

    this.codesService.delete(code.id);

    const account = await this.accountsService.createLocalAccount(data);

    const { access_token } = this.login(account);

    return {
      data: account,
      access_token,
    };
  }

  async googleAuth(access_token: string): Promise<RegisterViewDto> {
    const { email, family_name, given_name } =
      await this.googleService.getUserCredentials(access_token);

    const registeredUser = await this.accountsService.getAccount(email);

    if (registeredUser) {
      const { access_token } = this.login(registeredUser as Account);

      return {
        data: registeredUser,
        access_token,
      };
    } else {
      const newAccount = await this.accountsService.createAccountViaGoogle({
        email,
        username: (given_name + family_name).replace(/ /g, '').toLowerCase(),
        password: Math.random().toString(36).substring(2, 8),
        display_name: given_name + ' ' + family_name,
      });

      const { access_token } = this.login(newAccount);

      return {
        data: newAccount,
        access_token,
      };
    }
  }

  login(account: SelectedAccountFields): { access_token: string } {
    const payload = {
      sub: account.id,
      username: account.username,
      display_name: account.display_name,
      image: account.image,
      role: account.role,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>(ProcessEnv.JWT_SECRET),
      }),
    };
  }

  async validateAccount(
    username: string,
    pass: string,
  ): Promise<SelectedAccountFields> | null {
    const account = await this.accountsService.getAccount(username);

    if (account && account.password === pass) {
      delete account.password;
      delete account.email;

      return account;
    }

    return null;
  }
}
