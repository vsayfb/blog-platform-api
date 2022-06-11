import { GoogleService } from 'src/apis/google/google.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from 'src/accounts/accounts.service';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { CodesService } from 'src/codes/codes.service';
import { JWT_SECRET } from 'src/common/env';
import { INVALID_CODE } from 'src/common/error-messages';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly googleService: GoogleService,
    private readonly configService: ConfigService,
    private readonly codeService: CodesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    data: CreateAccountDto,
  ): Promise<{ account: Account; access_token: string } | ForbiddenException> {
    const code = await this.codeService.getCode(data.verification_code);

    if (!code || code.receiver !== data.email)
      throw new ForbiddenException(INVALID_CODE);

    this.codeService.removeCode(code.id);

    const account = await this.accountsService.createLocalAccount(data);

    const { access_token } = this.login(account);

    delete account.password;

    return { account, access_token };
  }

  async googleAuth(
    access_token: string,
  ): Promise<{ account: Account; access_token: string }> {
    const { email, family_name, given_name } =
      await this.googleService.getUserCredentials(access_token);

    const registeredUser = await this.accountsService.getAccount(email);

    if (registeredUser) {
      const { access_token } = this.login(registeredUser);

      delete registeredUser.password;

      return { account: registeredUser, access_token };
    } else {
      const newAccount = await this.accountsService.createAccountViaGoogle({
        email,
        username: (given_name + family_name).replace(/ /g, '').toLowerCase(),
        password: Math.random().toString(36).substring(2, 8),
      });

      const { access_token } = this.login(newAccount);

      delete newAccount.password;

      return { account: newAccount, access_token };
    }
  }

  login(account: Account): { access_token: string } {
    const payload = {
      username: account.username,
      sub: account.id,
      image: account.image,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>(JWT_SECRET),
      }),
    };
  }

  async validateAccount(username: string, pass: string): Promise<any> {
    const account = await this.accountsService.getAccount(username);

    if (account && account.password === pass) {
      const { password, ...result } = account;

      return result;
    }

    return null;
  }
}
