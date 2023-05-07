import { randomUUID } from 'crypto';
import { Account } from '../../../entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService, CREDENTIALS } from '../../accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailsService } from 'src/mails/mails.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { Like, Repository } from 'typeorm';
import { AccountMessages } from '../../../enums/account-messages';
import { SelectedAccountFields } from '../../../types/selected-account-fields';
import { PasswordManagerService } from '../../password-manager.service';
import { CacheJsonService } from 'src/cache/services/cache-json.service';
import { AccountWithCredentials } from '../../../types/account-with-credentials';
import { mockRepository } from '../../../../../../test/helpers/utils/mockRepository';
import { accountDummy } from 'src/resources/accounts/dummy/accountDummy';
import { CACHED_ROUTES } from '../../../../../cache/constants/cached-routes';

jest.mock('src/uploads/uploads.service.ts');
jest.mock('src/mails/mails.service.ts');
jest.mock('src/resources/accounts/services/password-manager.service.ts');
jest.mock('src/cache/services/cache-json.service.ts');

describe('AccountsService', () => {
  let accountsService: AccountsService;
  let accountsRepository: Repository<Account>;
  let uploadsService: UploadsService;
  let mailService: MailsService;
  let passwordManagerService: PasswordManagerService;
  let cacheJsonService: CacheJsonService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        PasswordManagerService,
        MailsService,
        UploadsService,
        CacheJsonService,
        {
          provide: getRepositoryToken(Account),
          useClass: Repository,
        },
      ],
    }).compile();

    accountsService = module.get<AccountsService>(AccountsService);
    accountsRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
    uploadsService = module.get<UploadsService>(UploadsService);
    mailService = module.get<MailsService>(MailsService);
    cacheJsonService = module.get<CacheJsonService>(CacheJsonService);
    passwordManagerService = module.get<PasswordManagerService>(
      PasswordManagerService,
    );

    mockRepository(accountsRepository, Account);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOneByID', () => {
    describe('when getOneByID is called', () => {
      let result: SelectedAccountFields;
      const id = randomUUID();

      beforeEach(async () => {
        result = await accountsService.getOneByID(id);
      });

      test('calls accountsRepository.findOne method', () => {
        expect(accountsRepository.findOneBy).toHaveBeenCalledWith({
          id,
        });
      });

      it('should return an account', () => {
        expect(result).toEqual(accountDummy());
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let result;

      const account = accountDummy();

      beforeEach(async () => {
        result = await accountsService.update(account as Account);
      });

      it('should call accountsRepository.save', () => {
        expect(accountsRepository.save).toHaveBeenCalledWith(account);
      });

      it('should call cacheJsonService.updateFields', () => {
        expect(cacheJsonService.update).toHaveBeenCalledWith({
          key: CACHED_ROUTES.CLIENT_ACCOUNT + account.id,
          data: account,
        });
      });

      it('should return account', () => {
        expect(result).toEqual(accountDummy());
      });
    });
  });

  describe('getCredentialsByUsernameOrEmailOrPhone', () => {
    let result: AccountWithCredentials;
    const value = accountDummy().username;

    beforeEach(async () => {
      result = await accountsService.getCredentialsByUsernameOrEmailOrPhone(
        value,
      );
    });

    test('calls accountsRepository.findOne method', () => {
      expect(accountsRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            username: value,
          },
          {
            email: value,
          },
          {
            mobile_phone: value,
          },
        ],
        relations: { two_factor_auth: true },
        select: CREDENTIALS,
      });
    });

    it('should return the account', () => {
      expect(result).toEqual(accountDummy());
    });
  });

  describe('getCredentialsByID', () => {
    let result: AccountWithCredentials;
    const accountID = accountDummy().id;

    beforeEach(async () => {
      result = await accountsService.getCredentialsByID(accountID);
    });

    test('calls accountsRepository.findOne', () => {
      expect(accountsRepository.findOne).toHaveBeenCalledWith({
        where: { id: accountID },
        select: CREDENTIALS,
        relations: { two_factor_auth: true },
      });
    });

    it('should return the account', () => {
      expect(result).toEqual(accountDummy());
    });
  });

  describe('getOneByEmail', () => {
    let result: SelectedAccountFields;
    const email = accountDummy().email;

    beforeEach(async () => {
      result = await accountsService.getOneByEmail(email);
    });

    test('calls accountsRepository.findOneBy method', () => {
      expect(accountsRepository.findOneBy).toHaveBeenCalledWith({
        email,
      });
    });

    it('should return the account', () => {
      expect(result).toEqual(accountDummy());
    });
  });

  describe('getOneByMobilePhone', () => {
    let result: SelectedAccountFields;
    const phone = accountDummy().mobile_phone;

    beforeEach(async () => {
      result = await accountsService.getOneByMobilePhone(phone);
    });

    test('calls accountsRepository.findOneBy method', () => {
      expect(accountsRepository.findOneBy).toHaveBeenCalledWith({
        mobile_phone: phone,
      });
    });

    it('should return the account', () => {
      expect(result).toEqual(accountDummy());
    });
  });

  describe('getOneByUsername', () => {
    let result: SelectedAccountFields;
    const username = accountDummy().username;

    beforeEach(async () => {
      result = await accountsService.getOneByUsername(username);
    });

    test('calls accountsRepository.findOneBy method', () => {
      expect(accountsRepository.findOneBy).toHaveBeenCalledWith({
        username,
      });
    });

    it('should return the account', () => {
      expect(result).toEqual(accountDummy());
    });
  });

  describe('searchByUsername', () => {
    let result: SelectedAccountFields[];
    const username = accountDummy().username;

    beforeEach(async () => {
      result = await accountsService.searchByUsername(username);
    });

    test('calls accountsRepository.find method', () => {
      expect(accountsRepository.find).toHaveBeenCalledWith({
        where: { username: Like(`%${username}%`) },
        take: 10,
      });
    });

    it('should return the accounts', () => {
      expect(result).toEqual([accountDummy()]);
    });
  });

  describe('getAll', () => {
    let result: SelectedAccountFields[];

    beforeEach(async () => {
      result = await accountsService.getAll();
    });

    test('calls accountsRepository.find method', () => {
      expect(accountsRepository.find).toHaveBeenCalledWith();
    });

    it('should return the accounts', () => {
      expect(result).toEqual([accountDummy()]);
    });
  });

  describe('setMobilePhone', () => {
    describe('scenario : email is null', () => {
      it('throw a ForbiddenException', () => {
        const account = accountDummy();

        account.email = null;

        try {
          accountsService.setMobilePhone(account as Account, '9334456');
        } catch (e) {
          expect(e.message).toEqual(AccountMessages.MUST_HAS_PHONE_OR_EMAIL);
        }
      });
    });
  });

  describe('setEmail', () => {
    describe('scenario : mobile phone is null', () => {
      it('throw a ForbiddenException', () => {
        const account = accountDummy();

        account.mobile_phone = null;

        try {
          accountsService.setEmail(account as Account, '9334456');
        } catch (e) {
          expect(e.message).toEqual(AccountMessages.MUST_HAS_PHONE_OR_EMAIL);
        }
      });
    });
  });
});
