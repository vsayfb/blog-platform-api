import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsRepository {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  createAccount(data: CreateAccountDto) {
    return this.accountsRepository.save(data);
  }

  async existsByUsername(username: string) {
    return !!(await this.accountsRepository.findOne({ username }));
  }

  async existsByEmail(email: string) {
    return !!(await this.accountsRepository.findOne({ email }));
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    return this.accountsRepository.findOne({
      where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });
  }
}
