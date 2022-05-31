import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { AccountsRepository } from '../accounts.repository';
import { CreateAccountDto } from '../dto/create-account.dto';
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

  describe('save entity', () => {
    let data = accountStub();
    let result: CreateAccountDto;

    beforeEach(async () => {
      jest
        .spyOn(repo, 'save')
        .mockResolvedValueOnce({ id: randomUUID(), ...data } as any);

      result = await accounstRepository.createAccount(data);
    });

    test('calls save function in repository', () => {
      expect(repo.save).toHaveBeenCalled();
    });

    it('should return an account', () => {
      expect(result).toEqual({
        id: expect.any(String),
        ...data,
      });
    });
  });

  describe('findByUsernameOrEmail', () => {
    let result: Account;
    let account: Account | any = accountStub();

    beforeEach(async () => {
      jest
        .spyOn(repo, 'findOne')
        .mockResolvedValueOnce({ id: randomUUID(), ...account });
      result = await accounstRepository.findByUsernameOrEmail(account.email);
    });

    test('calls findOne method in acc repo', () => {
      expect(repo.findOne).toHaveBeenCalled();
    });

    it('should return an account', () => {
      expect(result).toEqual({
        id: expect.any(String),
        ...account,
      });
    });
  });

  describe('exists by username', () => {
    let result: boolean;
    let account: Account | any = accountStub();

    beforeEach(async () => {
      jest
        .spyOn(repo, 'findOne')
        .mockResolvedValueOnce({ id: randomUUID(), ...account });
      result = await accounstRepository.existsByUsername(account.username);
    });

    test('calls findOne method in acc repo', () => {
      expect(repo.findOne).toHaveBeenCalled();
    });

    it('should return true', () => {
      expect(result).toBe(true);
    });
  });

  describe('exists by email', () => {
    let result: boolean;
    let account: Account | any = accountStub();

    beforeEach(async () => {
      jest
        .spyOn(repo, 'findOne')
        .mockResolvedValueOnce({ id: randomUUID(), ...account });
      result = await accounstRepository.existsByEmail(account.email);
    });

    test('calls findOne method in acc repo', () => {
      expect(repo.findOne).toHaveBeenCalled();
    });

    it('should return false', () => {
      expect(result).toBe(true);
    });
  });
});
