import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountsRepository } from 'src/accounts/accounts.repository';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly configService: ConfigService,
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

  async login(account: any) {
    const payload = { username: account.username, sub: account.userId };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    };
  }

  async register(data: CreateAccountDto) {
    const { email, username } = data;

    const usernameTaken = await this.accountsRepository.existsByUsername(
      username,
    );

    if (usernameTaken) throw new ForbiddenException('Username taken.');

    const emailTaken = await this.accountsRepository.existsByEmail(email);

    if (emailTaken) throw new ForbiddenException('Email taken.');

    return this.accountsRepository.createAccount(data);
  }
}
