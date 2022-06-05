import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import autoMock from 'src/utils/autoMock';
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

    autoMock(repo);
  });

  describe('findByUsernameOrEmail', () => {
    let result: Account;
    const account = accountStub();
    const expected = { id: expect.any(String), ...account };

    beforeEach(async () => {
      result = await accounstRepository.findByUsernameOrEmail(account.email);
    });

    test('calls findOne method in acc repo', () => {
      expect(repo.findOne).toHaveBeenCalledWith({
        where: [
          { email: expect.any(String) },
          { username: expect.any(String) },
        ],
      });
    });

    it('should return an account', () => {
      expect(result).toEqual(expected);
    });
  });

  describe('exists by username', () => {
    let result: boolean;
    const account = accountStub();

    beforeEach(async () => {
      result = await accounstRepository.existsByUsername(account.username);
    });

    test('calls findOne method in acc repo', () => {
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { username: account.username },
      });
    });

    it('should return true', () => {
      expect(result).toBe(true);
    });
  });

  describe('exists by email', () => {
    let result: boolean;
    const account: Account | any = accountStub();

    beforeEach(async () => {
      result = await accounstRepository.existsByEmail(account.email);
    });

    test('calls findOne method in acc repo', () => {
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: account.email },
      });
    });

    it('should return true', () => {
      expect(result).toBe(true);
    });
  });
});
