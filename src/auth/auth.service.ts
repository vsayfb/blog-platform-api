import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountsRepository } from 'src/accounts/accounts.repository';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private jwtService: JwtService,
  ) {}

  async validateAccount(username: string, pass: string): Promise<any> {
    const account = await this.accountsRepository.findByUsernameOrEmail(
      username,
    );

    if (account && account.password === pass) {
      const { password, ...result } = account;

      return result;
    }

    return null;
  }

  login(account: any) {
    const payload = { username: account.username, sub: account.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: CreateAccountDto) {
    const usernameTaken = await this.accountsRepository.existsByUsername(
      data.username,
    );

    const emailTaken = await this.accountsRepository.existsByEmail(data.email);

    if (usernameTaken) throw new ForbiddenException('Username taken.');

    if (emailTaken) throw new ForbiddenException('Email taken.');

    return this.accountsRepository.createAccount(data);
  }
}
