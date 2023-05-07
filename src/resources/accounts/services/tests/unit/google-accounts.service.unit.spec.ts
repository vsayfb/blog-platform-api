import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Account,
  RegisterType,
} from 'src/resources/accounts/entities/account.entity';
import { GoogleAccountsService } from 'src/resources/accounts/services/google-accounts.service';
import { PasswordManagerService } from 'src/resources/accounts/services/password-manager.service';
import { googleUserCredentialsDummy } from 'src/apis/google/dummy/google-credentials.dummy';
import { AccountMessages } from 'src/resources/accounts/enums/account-messages';
import { hashDummy } from 'src/global/hash-manager/dummy/hash.dummy';
import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { accountDummy } from 'src/resources/accounts/dummy/accountDummy';
import { mockRepository } from '../../../../../../test/helpers/utils/mockRepository';
import { CREDENTIALS } from '../../accounts.service';
import { AccountWithCredentials } from '../../../types/account-with-credentials';

jest.mock('src/resources/accounts/services/password-manager.service');

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

  describe('create', () => {
    const data = googleUserCredentialsDummy();

    describe('when create is called', () => {
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

        it('should call passwordManagerService.hashPassword', () => {
          expect(passwordManagerService.hashPassword).toHaveBeenCalled();
        });

        it('should call accountsRepository.save', () => {
          expect(accountRepository.save).toHaveBeenCalledWith({
            email: data.email,
            username: expect.any(String),
            display_name: expect.any(String),
            image: expect.any(String),
            password: hashDummy().hashedText,
            via: RegisterType.GOOGLE,
          });
        });

        it('should return the created account', () => {
          expect(result).toEqual(accountDummy());
        });
      });
    });
  });

  describe('getOneByID', () => {
    let result: SelectedAccountFields;

    const id = accountDummy().id;

    beforeEach(async () => {
      result = await googleAccountsService.getOneByID(id);
    });

    it('should call accountsRepository.findOne', () => {
      expect(accountRepository.findOneBy).toHaveBeenCalledWith({
        id,
        via: RegisterType.GOOGLE,
      });
    });

    it('should return an account', () => {
      expect(result).toEqual(accountDummy());
    });
  });

  describe('getCredentialsByEmail', () => {
    let result: AccountWithCredentials;

    const email = accountDummy().email;

    beforeEach(async () => {
      result = await googleAccountsService.getCredentialsByEmail(email);
    });

    it('should call accountsRepository.findOne', () => {
      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: {
          via: RegisterType.GOOGLE,
          email,
        },
        select: CREDENTIALS,
        relations: { two_factor_auth: true },
      });
    });

    it('should return an account', () => {
      expect(result).toEqual(accountDummy());
    });
  });
});
