import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import autoMockBaseRepo from 'src/utils/autoMockBaseRepo';
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

    autoMockBaseRepo(repo);
  });

  describe('findByUsernameOrEmail', () => {
    let result: Account;
    const account = accountStub();
    const expected = { id: expect.any(String), ...account };

    describe('when findByUsernameOrEmail is called ', () => {
      beforeEach(async () => {
        result = await accounstRepository.findByUsernameOrEmail(account.email);
      });

      test('findOne method should be called', () => {
        expect(repo.findOne).toHaveBeenCalled();
      });

      it('should return an account', () => {
        expect(result).toEqual(expected);
      });
    });
  });

  describe('exists by username', () => {
    describe('when existsByUsername called', () => {
      let result: boolean;
      const account = accountStub();

      beforeEach(async () => {
        result = await accounstRepository.existsByUsername(account.username);
      });

      test('findOne method should be called', () => {
        expect(repo.findOne).toHaveBeenCalled();
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });
});
