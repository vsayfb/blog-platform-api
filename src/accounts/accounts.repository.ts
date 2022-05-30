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

  existsByUsername(username: string) {
    return this.accountRepository.findOne({ username });
  }

  existsByEmail(email: string) {
    return this.accountRepository.findOne({ email });
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    return await this.accountRepository.findOne({
      where: {
        email: usernameOrEmail,
        username: usernameOrEmail,
      },
    });
  }
}
