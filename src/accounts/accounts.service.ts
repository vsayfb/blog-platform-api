import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccountRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private accountRepository: AccountRepository) {}

  private readonly accounts = [
    {
      id: 1,
      username: 'john',
      email: 'john@gmail.com',
      password: 'changeme',
    },
    {
      id: 2,
      username: 'maria',
      email: 'maria@gmail.com',
      password: 'guess',
    },
  ];

  async findOne(username: string) {
    return this.accounts.find((user) => user.username === username);
  }

  async createAccount(data: CreateAccountDto) {
    if (await this.accountRepository.existsByUsername(data.username)) {
      throw new ForbiddenException('Username taken.');
    }

    if (await this.accountRepository.existsByEmail(data.email)) {
      throw new ForbiddenException('Email taken.');
    }

    return this.accountRepository.createAccount(data);
  }
}
