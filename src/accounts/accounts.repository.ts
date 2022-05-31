import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsRepository {
  constructor(@InjectRepository(Account) private entity: Repository<Account>) {}

  createAccount(data: CreateAccountDto) {
    return this.entity.save(data);
  }

  async existsByUsername(username: string) {
    return !!(await this.entity.findOne({ username }));
  }

  async existsByEmail(email: string) {
    return !!(await this.entity.findOne({ email }));
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    return await this.entity.findOne({
      where: {
        email: usernameOrEmail,
        username: usernameOrEmail,
      },
    });
  }
}
