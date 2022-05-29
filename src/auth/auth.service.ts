import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from 'src/accounts/accounts.service';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private jwtService: JwtService,
  ) {}

  async validateAccount(username: string, pass: string): Promise<any> {
    const account = await this.accountsService.findOneByUsername(username);

    if (account && account.password === pass) {
      delete account.password;
      return account;
    }

    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: CreateAccountDto) {
    return this.accountsService.create(data);
  }
}
