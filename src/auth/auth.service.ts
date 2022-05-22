import { Injectable } from '@nestjs/common';
import { AccountsService } from 'src/accounts/accounts.service';

@Injectable()
export class AuthService {
  constructor(private readonly accountsService: AccountsService) {}

  async validateAccount(username: string, pass: string): Promise<any> {
    const account = await this.accountsService.findOne(username);

    if (account && account.password === pass) {
      const { password, ...result } = account;
      return result;
    }

    return null;
  }
}
