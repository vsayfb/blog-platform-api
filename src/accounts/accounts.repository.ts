import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
  ) {}

  createAccount(data: CreateAccountDto) {
    return this.accountRepository.save(data);
  }
}
