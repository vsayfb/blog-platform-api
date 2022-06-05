import { GoogleService } from 'src/google/google.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from 'src/accounts/accounts.service';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly googleService: GoogleService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAccount(username: string, pass: string): Promise<any> {
    const account = await this.accountsService.getAccount(username);

    if (account && account.password === pass) {
      const { password, ...result } = account;

      return result;
    }

    return null;
  }

  async login(account: any) {
    const payload = { username: account.username, sub: account.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    };
  }

  async register(data: CreateAccountDto) {
    return this.accountsService.createAccount(data);
  }

  async googleAuth(access_token: string): Promise<any> {
    const credentials = await this.googleService.authorization(access_token);

    console.log(credentials);

    return 'ok';
  }
}
