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
import { GoogleAccountsService } from '../../google-accounts.service';
import { accountDummy } from 'src/resources/accounts/dummy/accountDummy';
import { AccountMessages } from 'src/resources/accounts/enums/account-messages';

describe('GoogleAccountsService (INT)', () => {
  let googleAccountsService: GoogleAccountsService;
  let googleAccountsRepository: Repository<Account>;
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

    googleAccountsRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );

    passwordManagerService = module.get<PasswordManagerService>(
      PasswordManagerService,
    );

    googleAccountsService = new GoogleAccountsService(
      googleAccountsRepository,
      passwordManagerService,
    );
  });

  describe('create', () => {
    afterAll(async () => {
      await googleAccountsRepository.delete({});
    });

    describe('scenario : email is taken', () => {
      it('should throw a Forbidden exception', async () => {
        const fakeAccount = generateFakeAccount();

        const { email } = await googleAccountsRepository.save({
          ...fakeAccount,
        });

        await expect(
          googleAccountsService.create({
            familyName: fakeAccount.display_name,
            givenName: fakeAccount.display_name,
            email,
          }),
        ).rejects.toThrow(AccountMessages.EMAIL_TAKEN);
      });
    });

    it('should create new account', async () => {
      const fakeAccount = generateFakeAccount();

      const result = await googleAccountsService.create({
        familyName: fakeAccount.display_name,
        givenName: fakeAccount.display_name,
        email: fakeAccount.email,
      });

      const account = await googleAccountsService.getCredentialsByEmail(
        fakeAccount.email,
      );

      expect(account.id).toBe(result.id);
      expect(account.via).toEqual(RegisterType.GOOGLE);
      expect(result.image).toEqual(expect.any(String));
      expect(account.password).not.toBe(fakeAccount.password);
      expect(account.password).toEqual(expect.any(String));
    });
  });

  describe('getOneByID', () => {
    afterAll(async () => {
      await googleAccountsRepository.delete({});
    });

    describe('scenario : id is invalid', () => {
      it('should return null', async function () {
        const result = await googleAccountsService.getOneByID(randomUUID());

        expect(result).toBeNull();
      });
    });

    describe('scenario : id is valid', () => {
      it('should return an account', async function () {
        const fakeAccount = generateFakeAccount();

        const account = await googleAccountsRepository.save({
          ...fakeAccount,
          via: RegisterType.GOOGLE,
        });

        const result = await googleAccountsService.getOneByID(account.id);

        expect(result).not.toBeNull();

        expect(result.id).toBe(account.id);
      });
    });
  });

  describe('getCredentialsByEmail', () => {
    const fakeAccount = generateFakeAccount();

    let account: Account;

    beforeAll(async () => {
      account = await googleAccountsRepository.save({
        ...fakeAccount,
        via: RegisterType.GOOGLE,
      });
    });

    afterAll(async () => {
      await googleAccountsRepository.delete({});
    });

    describe('scenario : email is invalid', () => {
      it('should return null', async () => {
        const result = await googleAccountsService.getCredentialsByEmail(
          accountDummy().email,
        );

        expect(result).toBeNull();
      });
    });

    describe('scenario : email is valid', () => {
      it('should return an account', async () => {
        const result = await googleAccountsService.getCredentialsByEmail(
          fakeAccount.email,
        );

        expect(result).not.toBeNull();
        expect(result.id).toBe(account.id);
        expect(result.email).toBe(account.email);
      });
    });
  });
});
