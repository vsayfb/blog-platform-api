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

    jest.clearAllMocks();
  });

  describe('getAccount method', () => {
    describe('when getAccount method is called', () => {
      let result: Account;
      const { username, email } = accountStub();

      beforeEach(async () => {
        result = await accounstService.getAccount(username);
      });

      test('findByUsernameOrEmail method should be called with username or email', () => {
        expect(accountsRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
          username || email,
        );
      });

      it('then should return an account', () => {
        expect(result).toEqual({ id: expect.any(String), ...result });
      });
    });
  });

  describe('createAccount method', () => {
    const dto = accountStub();

    describe('when createAccount method is called ', () => {
      describe('if : username exists in the db', () => {
        test('throws "Username taken." error', async () => {
          jest
            .spyOn(accountsRepository, 'existsByUsername')
            .mockResolvedValueOnce(true);

          await expect(accounstService.createLocalAccount(dto)).rejects.toThrow(
            'Username taken.',
          );

          expect(accountsRepository.existsByUsername).toHaveBeenCalledTimes(1);
        });
      });

      describe('if : email exists in the db', () => {
        test('throws "Email taken." error', async () => {
          jest
            .spyOn(accountsRepository, 'existsByEmail')
            .mockResolvedValueOnce(true);

          await expect(accounstService.createLocalAccount(dto)).rejects.toThrow(
            'Email taken.',
          );

          expect(accountsRepository.existsByEmail).toHaveBeenCalledTimes(1);
        });
      });

      describe('if: unique username and email', () => {
        let result: Account;

        beforeEach(async () => {
          result = await accounstService.createLocalAccount(dto);
        });

        test('existsByUsername method should be called with username', () => {
          expect(accountsRepository.existsByUsername).toHaveBeenCalledWith(
            dto.username,
          );
        });

        test('existsByEmail method should be called with email', () => {
          expect(accountsRepository.existsByEmail).toHaveBeenCalledWith(
            dto.email,
          );
        });

        it('then should return an account', () => {
          expect(result).toEqual({ id: expect.any(String), ...dto });
        });
      });
    });
  });
});
