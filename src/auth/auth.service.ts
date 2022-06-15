import { GoogleService } from 'src/apis/google/google.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from 'src/accounts/accounts.service';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { CodesService } from 'src/codes/codes.service';
import { JWT_SECRET } from 'src/common/env';
import { INVALID_CODE, INVALID_EMAIL } from 'src/common/error-messages';
import { RegisterViewDto } from 'src/accounts/dto/register-view.dto';

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
  ): Promise<RegisterViewDto | ForbiddenException> {
    const code = await this.codeService.getCode(data.verification_code);

    if (!code) throw new ForbiddenException(INVALID_CODE);

    if (code.receiver !== data.email) {
      throw new ForbiddenException(INVALID_EMAIL);
    }

    this.codeService.removeCode(code.id);

    const account = await this.accountsService.createLocalAccount(data);

    const { access_token } = this.login(account);

    return {
      account: {
        id: account.id,
        image: account.image,
        username: account.username,
      },
      access_token,
    };
  }

  async googleAuth(access_token: string): Promise<RegisterViewDto> {
    const { email, family_name, given_name } =
      await this.googleService.getUserCredentials(access_token);

    const registeredUser = await this.accountsService.getAccount(email);

    if (registeredUser) {
      const { access_token } = this.login(registeredUser);

      return {
        account: {
          id: registeredUser.id,
          image: registeredUser.image,
          username: registeredUser.username,
        },
        access_token,
      };
    } else {
      const newAccount = await this.accountsService.createAccountViaGoogle({
        email,
        username: (given_name + family_name).replace(/ /g, '').toLowerCase(),
        password: Math.random().toString(36).substring(2, 8),
      });

      const { access_token } = this.login(newAccount);

      return {
        account: {
          id: newAccount.id,
          image: newAccount.image,
          username: newAccount.username,
        },
        access_token,
      };
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
