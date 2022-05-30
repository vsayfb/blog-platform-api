import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { AccountsRepository } from '../accounts.repository';
import { Account } from '../entities/account.entity';
import { accountStub } from './stub/account.stub';

describe('AccountsRepository', () => {
  let accounstRepository: AccountsRepository;
  let repo: Repository<Account>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsRepository,
        {
          provide: getRepositoryToken(Account),
          useClass: Repository,
        },
      ],
    }).compile();

    accounstRepository = module.get<AccountsRepository>(AccountsRepository);
    repo = module.get<Repository<Account>>(getRepositoryToken(Account));
  });

  it('should be defined', async () => {
    let data = accountStub();

    jest
      .spyOn(repo, 'save')
      .mockResolvedValueOnce({ id: randomUUID(), ...data } as any);

    expect(await accounstRepository.createAccount(data)).toEqual({
      id: expect.any(String),
      ...data,
    });

    expect(repo.save).toHaveBeenCalledWith(data);
  });
});
