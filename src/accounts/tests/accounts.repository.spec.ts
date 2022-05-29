import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccountsRepository } from '../accounts.repository';
import { Account } from '../entities/account.entity';

describe('AccountsRepository', () => {
  let repository: AccountsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsRepository,
        {
          provide: getRepositoryToken(Account),
          useValue: {},
        },
      ],
    }).compile();

    repository = module.get<AccountsRepository>(AccountsRepository);
  });

  it('should be defined', () => {});
});
