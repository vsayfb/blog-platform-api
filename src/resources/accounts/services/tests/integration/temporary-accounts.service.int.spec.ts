jest.setTimeout(30000);

import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from '../../../../../../ormconfig';
import { TemporaryAccount } from '../../../entities/temporary-account.entity';
import { randomUUID } from 'crypto';
import { generateFakeAccount } from 'src/lib/test_helpers/generateFakeUser';
import { accountDummy } from '../../../dummy/accountDummy';
import { TemporaryAccountsService } from '../../temporary-accounts.service';

describe('TemporaryAccountsService (INT)', () => {
  let temporaryAccountsService: TemporaryAccountsService;
  let temporaryAccountsRepository: Repository<TemporaryAccount>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dataSource.options),
        TypeOrmModule.forFeature([TemporaryAccount]),
      ],
      providers: [
        { provide: getRepositoryToken(TemporaryAccount), useClass: Repository },
      ],
    }).compile();

    temporaryAccountsRepository = module.get<Repository<TemporaryAccount>>(
      getRepositoryToken(TemporaryAccount),
    );

    temporaryAccountsService = new TemporaryAccountsService(
      temporaryAccountsRepository,
    );
  });

  describe('getOneByID', () => {
    afterAll(async () => {
      await temporaryAccountsRepository.delete({});
    });

    describe('scenario : id is invalid', () => {
      it('should return null', async function () {
        const result = await temporaryAccountsService.getOneByID(randomUUID());

        expect(result).toBeNull();
      });
    });

    describe('scenario : id is valid', () => {
      it('should return an account', async function () {
        const fakeAccount = generateFakeAccount();

        const account = await temporaryAccountsRepository.save(fakeAccount);

        const result = await temporaryAccountsService.getOneByID(account.id);

        expect(result).not.toBeNull();

        expect(result.id).toBe(account.id);
      });
    });
  });

  describe('getAll', () => {
    it('should return an array', async () => {
      const result = await temporaryAccountsService.getAll();

      expect(result).toEqual(expect.any(Array));
    });
  });

  describe('create', () => {
    afterAll(async () => {
      await temporaryAccountsRepository.delete({});
    });

    it('should create new account', async () => {
      const fakeAccount = generateFakeAccount();

      const result = await temporaryAccountsService.create({ ...fakeAccount });

      const account = await temporaryAccountsRepository.findOneBy({
        id: result.id,
      });

      expect(result).not.toBe(null);
      expect(result.id).toBe(account.id);
    });
  });

  describe('getOneByEmailOrMobilePhone', () => {
    const fakeAccount = generateFakeAccount();

    let account: TemporaryAccount;

    beforeAll(async () => {
      account = await temporaryAccountsRepository.save(fakeAccount);
    });

    afterAll(async () => {
      await temporaryAccountsRepository.delete({});
    });

    describe('scenario : value is unknown', () => {
      it('should return an account', async () => {
        const result =
          await temporaryAccountsService.getOneByEmailOrMobilePhone(
            accountDummy().email,
          );

        expect(result).toBeNull();
      });
    });

    describe('scenario : value is email', () => {
      it('should return an account', async () => {
        const result =
          await temporaryAccountsService.getOneByEmailOrMobilePhone(
            account.email,
          );

        expect(result).not.toBeNull();
      });
    });

    describe('scenario : value is mobile phone', () => {
      it('should return an account', async () => {
        const result =
          await temporaryAccountsService.getOneByEmailOrMobilePhone(
            account.mobile_phone,
          );

        expect(result).not.toBeNull();
      });
    });
  });

  describe('getOneByEmail', () => {
    const fakeAccount = generateFakeAccount();

    let account: TemporaryAccount;

    beforeAll(async () => {
      account = await temporaryAccountsRepository.save(fakeAccount);
    });

    afterAll(async () => {
      await temporaryAccountsRepository.delete({});
    });

    describe('scenario : email is invalid', () => {
      it('should return null', async () => {
        const result = await temporaryAccountsService.getOneByEmail(
          accountDummy().email,
        );

        expect(result).toBeNull();
      });
    });

    describe('scenario : email is valid', () => {
      it('should return an account', async () => {
        const result = await temporaryAccountsService.getOneByEmail(
          account.email,
        );

        expect(result).not.toBeNull();
      });
    });
  });

  describe('getOneByMobilePhone', () => {
    const fakeAccount = generateFakeAccount();

    let account: TemporaryAccount;

    beforeAll(async () => {
      account = await temporaryAccountsRepository.save(fakeAccount);
    });

    afterAll(async () => {
      await temporaryAccountsRepository.delete({});
    });

    describe('scenario : mobile phone is invalid', () => {
      it('should return null', async () => {
        const result = await temporaryAccountsService.getOneByMobilePhone(
          accountDummy().mobile_phone,
        );

        expect(result).toBeNull();
      });
    });

    describe('scenario : mobile phone is valid', () => {
      it('should return an account', async () => {
        const result = await temporaryAccountsService.getOneByMobilePhone(
          account.mobile_phone,
        );

        expect(result).not.toBeNull();
      });
    });
  });

  describe('getOneByUsername', () => {
    const fakeAccount = generateFakeAccount();

    let account: TemporaryAccount;

    beforeAll(async () => {
      account = await temporaryAccountsRepository.save(fakeAccount);
    });

    afterAll(async () => {
      await temporaryAccountsRepository.delete({});
    });

    describe('scenario : username is invalid', () => {
      it('should return null', async () => {
        const result = await temporaryAccountsService.getOneByUsername(
          accountDummy().username,
        );

        expect(result).toBeNull();
      });
    });

    describe('scenario : username is valid', () => {
      it('should return an account', async () => {
        const result = await temporaryAccountsService.getOneByUsername(
          account.username,
        );

        expect(result).not.toBeNull();
        expect(result.username).toBe(account.username);
      });
    });
  });

  describe('deleteByUsernameIfExist', () => {
    describe('scenario : account does not exist by username in db', () => {
      it('should return void', async () => {
        const res = await temporaryAccountsService.deleteByUsernameIfExist(
          accountDummy().username,
        );

        expect(res).toBeUndefined();
      });
    });

    describe('scenario : account exists by username in db', () => {
      afterAll(async () => {
        await temporaryAccountsRepository.delete({});
      });

      it('should return void', async () => {
        const fakeAccount = generateFakeAccount();

        const account = await temporaryAccountsRepository.save({
          ...fakeAccount,
        });

        const deleted = await temporaryAccountsService.deleteByUsernameIfExist(
          account.username,
        );

        const result = await temporaryAccountsRepository.findOneBy({
          id: account.id,
        });

        expect(deleted).toEqual(true);
        expect(result).toBeNull();
      });
    });
  });

  describe('delete', () => {
    let account: TemporaryAccount;

    beforeAll(async () => {
      account = await temporaryAccountsRepository.save(generateFakeAccount());
    });

    afterAll(async () => {
      await temporaryAccountsRepository.delete({});
    });

    it('should delete account', async () => {
      const dbAccount = await temporaryAccountsRepository.findOneBy({
        id: account.id,
      });

      expect(dbAccount).not.toBeNull();

      await temporaryAccountsService.delete(account);

      const result = await temporaryAccountsRepository.findOneBy({
        id: account.id,
      });

      expect(result).toBeNull();
    });
  });
});
