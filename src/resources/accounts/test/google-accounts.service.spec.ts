import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from '../../../test/helpers/utils/mockRepository';
import { Repository } from 'typeorm';
import { Account, RegisterType } from '../entities/account.entity';
import { GoogleAccountsService } from '../services/google-accounts.service';
import { PasswordManagerService } from '../services/password-manager.service';
import { googleUserCredentialsStub } from 'src/apis/google/stub/google-credentials.stub';
import { AccountMessages } from '../enums/account-messages';
import { hashStub } from 'src/global/hash-manager/test/stub/hash.stub';
import { SelectedAccountFields } from '../types/selected-account-fields';
import { accountStub } from './stub/account.stub';

jest.mock('src/accounts/services/password-manager.service');

describe('GoogleAccountsService', () => {
  let googleAccountsService: GoogleAccountsService;
  let passwordManagerService: PasswordManagerService;
  let accountRepository: Repository<Account>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GoogleAccountsService,
        PasswordManagerService,
        { provide: getRepositoryToken(Account), useClass: Repository<Account> },
      ],
    }).compile();

    googleAccountsService = module.get<GoogleAccountsService>(
      GoogleAccountsService,
    );

    passwordManagerService = module.get<PasswordManagerService>(
      PasswordManagerService,
    );

    accountRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );

    mockRepository(accountRepository, Account);
  });

  describe('register', () => {
    const data = googleUserCredentialsStub();

    describe('when register is called', () => {
      describe('scenario : given email is taken before', () => {
        test('should throw Email Taken error', async () => {
          await expect(googleAccountsService.create(data)).rejects.toThrow(
            AccountMessages.EMAIL_TAKEN,
          );
        });
      });

      describe('scenario : given email is not taken before', () => {
        let result: SelectedAccountFields;

        beforeEach(async () => {
          jest
            .spyOn(accountRepository, 'findOneBy')
            .mockResolvedValueOnce(null);

          result = await googleAccountsService.create(data);
        });

        test('calls passwordManagerService.hashPassword', () => {
          expect(passwordManagerService.hashPassword).toHaveBeenCalled();
        });

        test('calls accountsRepository.save', () => {
          expect(accountRepository.save).toHaveBeenCalledWith({
            email: data.email,
            username: expect.any(String),
            display_name: expect.any(String),
            password: hashStub().hashedText,
            via: RegisterType.GOOGLE,
          });
        });

        it('should return the created account', () => {
          expect(result).toEqual(accountStub());
        });
      });
    });
  });

  describe('getOneByEmail', () => {
    let result: SelectedAccountFields & { email: string; password: string };

    test('should return an account', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValueOnce({
        ...accountStub(),
        email: 'email',
        password: 'pass',
      } as any);

      result = await googleAccountsService.getOneByEmail('email');

      expect(result).toEqual({
        ...accountStub(),
        email: 'email',
        password: 'pass',
      });
    });
  });
});
