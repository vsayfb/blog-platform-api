import { accountStub } from './stub/account.stub';
import { Account } from './../entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsRepository } from '../accounts.repository';
import { AccountsService } from '../accounts.service';

jest.mock('src/accounts/accounts.repository');

describe('AccountsService', () => {
  let accounstService: AccountsService;
  let accountsRepository: AccountsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsService, AccountsRepository],
    }).compile();

    accounstService = module.get<AccountsService>(AccountsService);
    accountsRepository = module.get<AccountsRepository>(AccountsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccount', () => {
    let result: Account;
    const username = accountStub().username;

    beforeEach(async () => {
      result = await accounstService.getAccount(username);
    });

    test('calls findByUsernameOrEmail', () => {
      expect(accountsRepository.findByUsernameOrEmail).toHaveBeenCalledTimes(1);
      expect(accountsRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
        username,
      );
    });

    it('should return an account', () => {
      expect(result).toEqual({ id: expect.any(String), ...result });
    });
  });

  describe('createAccount', () => {
    let result: Account;
    const dto = accountStub();

    beforeEach(async () => {
      result = await accounstService.createLocalAccount(dto);
    });

    test('calls existsByUsername', () => {
      expect(accountsRepository.existsByUsername).toHaveBeenCalledTimes(1);
      expect(accountsRepository.existsByUsername).toHaveBeenCalledWith(
        dto.username,
      );
    });

    test('calls existsByEmail', () => {
      expect(accountsRepository.existsByEmail).toHaveBeenCalledTimes(1);
      expect(accountsRepository.existsByEmail).toHaveBeenCalledWith(dto.email);
    });

    test('calls createEntity', () => {
      expect(accountsRepository.createEntity).toHaveBeenCalledTimes(1);
      expect(accountsRepository.createEntity).toHaveBeenCalledWith(dto);
    });

    it('should return an account', () => {
      expect(result).toEqual({ id: expect.any(String), ...dto });
    });
  });
});
