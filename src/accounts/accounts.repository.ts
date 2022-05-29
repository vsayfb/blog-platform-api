import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsRepository {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
  ) {}

  createAccount(data: CreateAccountDto) {
    return this.accountRepository.save(data);
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    return await this.accountRepository.findOne({
      where: {
        email: usernameOrEmail,
        username: usernameOrEmail,
      },
    });
  }

  async existsByUsername(username: string) {
    return !!(await this.accountRepository.findOne({ username }));
  }

  async existsByEmail(email: string) {
    return !!(await this.accountRepository.findOne({ email }));
  }
}
