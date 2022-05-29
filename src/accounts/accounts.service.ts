import { Injectable } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private accountsRepository: AccountsRepository) {}

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

  async findOneByUsername(username: string) {
    return this.accounts.find((user) => user.username === username);
  }

  async create(data: CreateAccountDto) {
    return this.accountsRepository.createAccount(data);
  }
}
