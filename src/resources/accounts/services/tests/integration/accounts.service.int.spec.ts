jest.setTimeout(30000);

import { CACHED_ROUTES } from '../../../../../cache/constants/cached-routes';
import { AccountsService } from '../../accounts.service';
import { Repository } from 'typeorm';
import { Account } from '../../../entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PasswordManagerService } from '../../password-manager.service';
import { CacheJsonService } from '../../../../../cache/services/cache-json.service';
import { CacheManagerModule } from '../../../../../cache/cache-manager.module';
import { HashManagerModule } from '../../../../../global/hash-manager/hash-manager.module';
import { dataSource } from '../../../../../../ormconfig';
import { TemporaryAccount } from '../../../entities/temporary-account.entity';
import { RedisModule } from 'src/global/redis/redis.module';
import { ProcessEnv } from 'src/lib/enums/env';
import { randomUUID } from 'crypto';
import { generateFakeAccount } from 'src/lib/test_helpers/generateFakeUser';
import { accountDummy } from '../../../dummy/accountDummy';

describe('AccountsService (INT)', () => {
  let accountsService: AccountsService;
  let accountsRepository: Repository<Account>;
  let passwordManagerService: PasswordManagerService;
  let cacheJsonService: CacheJsonService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSource.options),
        TypeOrmModule.forFeature([Account]),
        RedisModule.forRoot({ url: process.env[ProcessEnv.REDIS_URL] }),
        CacheManagerModule,
        HashManagerModule,
      ],
      providers: [
        PasswordManagerService,
        CacheJsonService,
        { provide: getRepositoryToken(Account), useClass: Repository },
      ],
    }).compile();

    accountsRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );

    passwordManagerService = module.get<PasswordManagerService>(
      PasswordManagerService,
    );

    cacheJsonService = module.get<CacheJsonService>(CacheJsonService);

    accountsService = new AccountsService(
      accountsRepository,
      passwordManagerService,
      cacheJsonService,
    );
  });

  describe('getOneByID', () => {
    afterAll(async () => {
      await accountsRepository.delete({});
    });

    describe('scenario : id is invalid', () => {
      it('should return null', async function () {
        const result = await accountsService.getOneByID(randomUUID());

        expect(result).toBeNull();
      });
    });

    describe('scenario : id is valid', () => {
      it('should return an account', async function () {
        const fakeAccount = generateFakeAccount();

        const account = await accountsRepository.save(fakeAccount);

        const result = await accountsService.getOneByID(account.id);

        expect(result).not.toBeNull();

        expect(result.id).toBe(account.id);
      });
    });
  });

  describe('update', () => {
    afterAll(async () => {
      await accountsRepository.delete({});
      await cacheJsonService.deleteAll();
    });

    it('should return updated account', async () => {
      const fakeAccount = generateFakeAccount();

      const account = await accountsRepository.save({ ...fakeAccount });

      const cacheKey = CACHED_ROUTES.CLIENT_ACCOUNT + account.id;

      await cacheJsonService.save({ key: cacheKey, data: account });

      const newUsername = 'new_username';

      accountsService.setUsername(account, newUsername);

      await accountsService.update(account);

      const updatedAccount = await accountsRepository.findOneBy({
        id: account.id,
      });

      const updatedCache = await cacheJsonService.get(cacheKey);

      expect(updatedAccount).not.toBeNull();

      expect(updatedCache).not.toBeNull();

      expect(updatedAccount.username).not.toBe(fakeAccount.username);

      expect(updatedAccount.username).toBe(newUsername);

      expect(updatedCache.username).toBe(newUsername);
    });
  });

  describe('getCredentialsByUsernameOrEmailOrPhone', () => {
    const fakeAccount = generateFakeAccount();

    let account: Account;

    beforeAll(async () => {
      account = await accountsRepository.save(fakeAccount);
    });

    afterAll(async () => {
      await accountsRepository.delete({});
    });

    describe('scenario : value is invalid', () => {
      it('should return null', async () => {
        const result =
          await accountsService.getCredentialsByUsernameOrEmailOrPhone(
            'something',
          );

        expect(result).toBeNull();
      });
    });

    describe('scenario : value is username', () => {
      it('should return an account', async () => {
        const result =
          await accountsService.getCredentialsByUsernameOrEmailOrPhone(
            fakeAccount.username,
          );

        expect(result).not.toBeNull();
        expect(result.id).toBe(account.id);
        expect(result.username).toBe(account.username);
      });
    });
    describe('scenario : value is mobile phone', () => {
      it('should return an account', async () => {
        const result =
          await accountsService.getCredentialsByUsernameOrEmailOrPhone(
            fakeAccount.mobile_phone,
          );

        expect(result).not.toBeNull();
        expect(result.id).toBe(account.id);
        expect(result.mobile_phone).toBe(account.mobile_phone);
      });
    });
    describe('scenario : value is email', () => {
      it('should return an account', async () => {
        const result =
          await accountsService.getCredentialsByUsernameOrEmailOrPhone(
            fakeAccount.email,
          );

        expect(result).not.toBeNull();
        expect(result.id).toBe(account.id);
        expect(result.email).toBe(account.email);
      });
    });
  });

  describe('getCredentialsByID', () => {
    const fakeAccount = generateFakeAccount();

    let account: Account;

    beforeAll(async () => {
      account = await accountsRepository.save(fakeAccount);
    });

    afterAll(async () => {
      await accountsRepository.delete({});
    });

    describe('scenario : id is invalid', () => {
      it('should return null', async () => {
        const result = await accountsService.getCredentialsByID(randomUUID());

        expect(result).toBeNull();
      });
    });

    describe('scenario : id is valid', () => {
      it('should return an account', async () => {
        const result = await accountsService.getCredentialsByID(account.id);

        expect(result).not.toBeNull();
        expect(result.id).toBe(account.id);
      });
    });
  });

  describe('getOneByEmail', () => {
    const fakeAccount = generateFakeAccount();

    let account: Account;

    beforeAll(async () => {
      account = await accountsRepository.save(fakeAccount);
    });

    afterAll(async () => {
      await accountsRepository.delete({});
    });

    describe('scenario : email is invalid', () => {
      it('should return null', async () => {
        const result = await accountsService.getOneByEmail(
          accountDummy().email,
        );

        expect(result).toBeNull();
      });
    });

    describe('scenario : email is valid', () => {
      it('should return an account', async () => {
        const result = await accountsService.getOneByEmail(account.email);

        expect(result).not.toBeNull();
      });
    });
  });

  describe('getOneByMobilePhone', () => {
    const fakeAccount = generateFakeAccount();

    let account: Account;

    beforeAll(async () => {
      account = await accountsRepository.save(fakeAccount);
    });

    afterAll(async () => {
      await accountsRepository.delete({});
    });

    describe('scenario : mobile phone is invalid', () => {
      it('should return null', async () => {
        const result = await accountsService.getOneByMobilePhone(
          accountDummy().mobile_phone,
        );

        expect(result).toBeNull();
      });
    });

    describe('scenario : mobile phone is valid', () => {
      it('should return an account', async () => {
        const result = await accountsService.getOneByMobilePhone(
          account.mobile_phone,
        );

        expect(result).not.toBeNull();
      });
    });
  });

  describe('getOneByUsername', () => {
    const fakeAccount = generateFakeAccount();

    let account: Account;

    beforeAll(async () => {
      account = await accountsRepository.save(fakeAccount);
    });

    afterAll(async () => {
      await accountsRepository.delete({});
    });

    describe('scenario : username is invalid', () => {
      it('should return null', async () => {
        const result = await accountsService.getOneByUsername(
          accountDummy().username,
        );

        expect(result).toBeNull();
      });
    });

    describe('scenario : username is valid', () => {
      it('should return an account', async () => {
        const result = await accountsService.getOneByUsername(account.username);

        expect(result).not.toBeNull();
        expect(result.username).toBe(account.username);
      });
    });
  });

  describe('searchByUsername', () => {
    const fakeAccount = generateFakeAccount();

    let account: Account;

    beforeAll(async () => {
      account = await accountsRepository.save(fakeAccount);
    });

    afterAll(async () => {
      await accountsRepository.delete({});
    });

    describe('scenario : username is invalid', () => {
      it('should return null', async () => {
        const result = await accountsService.searchByUsername(
          accountDummy().username,
        );

        expect(result.length).toBe(0);
      });
    });

    describe('scenario : username is valid', () => {
      it('should return an account', async () => {
        const result = await accountsService.searchByUsername(
          account.username.substring(1, 3),
        );

        expect(result).not.toBeNull();
        expect(result.length).toBe(1);
        expect(result[0].username).toBe(account.username);
      });
    });
  });

  describe('getAll', () => {
    it('should return an array', async () => {
      const result = await accountsService.getAll();

      expect(result).toEqual(expect.any(Array));
    });
  });
});
