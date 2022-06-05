import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/database/base/base.repository';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsRepository extends BaseRepository<Account> {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {
    super(accountsRepository);
  }

  async existsByUsername(username: string) {
    return !!(await this.accountsRepository.findOne({ where: { username } }));
  }

  async existsByEmail(email: string) {
    return !!(await this.accountsRepository.findOne({ where: { email } }));
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    return this.accountsRepository.findOne({
      where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });
  }
}
