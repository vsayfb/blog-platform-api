jest.setTimeout(30000);

import { Repository } from 'typeorm';
import { Account, RegisterType } from '../../../entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PasswordManagerService } from '../../password-manager.service';
import { HashManagerModule } from '../../../../../global/hash-manager/hash-manager.module';
import { dataSource } from '../../../../../../ormconfig';
import { randomUUID } from 'crypto';
import { generateFakeAccount } from 'src/lib/test_helpers/generateFakeUser';
import { LocalAccountsService } from '../../local-accounts.service';

describe('LocalAccountsService (INT)', () => {
  let localAccountsService: LocalAccountsService;
  let localAccountsRepository: Repository<Account>;
  let passwordManagerService: PasswordManagerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSource.options),
        TypeOrmModule.forFeature([Account]),
        HashManagerModule,
      ],
      providers: [
        PasswordManagerService,
        { provide: getRepositoryToken(Account), useClass: Repository },
      ],
    }).compile();

    localAccountsRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );

    passwordManagerService = module.get<PasswordManagerService>(
      PasswordManagerService,
    );

    localAccountsService = new LocalAccountsService(
      localAccountsRepository,
      passwordManagerService,
    );
  });

  describe('create', () => {
    afterAll(async () => {
      await localAccountsRepository.delete({});
    });

    it('should create new account', async () => {
      const fakeAccount = generateFakeAccount();

      const result = await localAccountsService.create({
        ...fakeAccount,
      });

      const account =
        await localAccountsService.getCredentialsByUsernameOrEmailOrPhone(
          result.username,
        );

      expect(result.username).toBe(fakeAccount.username);
      expect(account.via).toEqual(RegisterType.LOCAL);
      expect(result.image).toEqual(expect.any(String));
      expect(account.password).not.toBe(fakeAccount.password);
      expect(account.password).toEqual(expect.any(String));
    });
  });

  describe('getOneByID', () => {
    afterAll(async () => {
      await localAccountsRepository.delete({});
    });

    describe('scenario : id is invalid', () => {
      it('should return null', async function () {
        const result = await localAccountsService.getOneByID(randomUUID());

        expect(result).toBeNull();
      });
    });

    describe('scenario : id is valid', () => {
      it('should return an account', async function () {
        const fakeAccount = generateFakeAccount();

        const account = await localAccountsRepository.save({
          ...fakeAccount,
          via: RegisterType.LOCAL,
        });

        const result = await localAccountsService.getOneByID(account.id);

        expect(result).not.toBeNull();

        expect(result.id).toBe(account.id);
      });
    });
  });

  describe('getCredentialsByUsernameOrEmailOrPhone', () => {
    const fakeAccount = generateFakeAccount();

    let account: Account;

    beforeAll(async () => {
      account = await localAccountsRepository.save({
        ...fakeAccount,
        via: RegisterType.LOCAL,
      });
    });

    afterAll(async () => {
      await localAccountsRepository.delete({});
    });

    describe('scenario : value is invalid', () => {
      it('should return null', async () => {
        const result =
          await localAccountsService.getCredentialsByUsernameOrEmailOrPhone(
            'something',
          );

        expect(result).toBeNull();
      });
    });

    describe('scenario : value is username', () => {
      it('should return an account', async () => {
        const result =
          await localAccountsService.getCredentialsByUsernameOrEmailOrPhone(
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
          await localAccountsService.getCredentialsByUsernameOrEmailOrPhone(
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
          await localAccountsService.getCredentialsByUsernameOrEmailOrPhone(
            fakeAccount.email,
          );

        expect(result).not.toBeNull();
        expect(result.id).toBe(account.id);
        expect(result.email).toBe(account.email);
      });
    });
  });
});
