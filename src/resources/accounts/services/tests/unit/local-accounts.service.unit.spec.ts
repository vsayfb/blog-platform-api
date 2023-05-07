import { Test } from '@nestjs/testing';
import { LocalAccountsService } from '../../local-accounts.service';
import { Account, RegisterType } from '../../../entities/account.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from '../../../../../../test/helpers/utils/mockRepository';
import { CreateLocalAccount } from '../../../../../auth/types/create-local-account';
import { accountDummy } from '../../../dummy/accountDummy';
import { PasswordManagerService } from '../../password-manager.service';
import { SelectedAccountFields } from '../../../types/selected-account-fields';

jest.mock('../../password-manager.service');
describe('LocalAccountsService', () => {
  let localAccountsService: LocalAccountsService;
  let passwordManagerService: PasswordManagerService;
  let accountsRepository: Repository<Account>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LocalAccountsService,
        PasswordManagerService,
        { provide: getRepositoryToken(Account), useClass: Repository },
      ],
    }).compile();

    localAccountsService = moduleRef.get(LocalAccountsService);
    passwordManagerService = moduleRef.get(PasswordManagerService);
    accountsRepository = moduleRef.get(getRepositoryToken(Account));

    mockRepository(accountsRepository, Account);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    let result;

    const data: CreateLocalAccount = {
      display_name: accountDummy().display_name,
      email: accountDummy().email,
      mobile_phone: accountDummy().mobile_phone,
      password: accountDummy().password,
      username: accountDummy().username,
    };

    beforeEach(async () => {
      result = await localAccountsService.create(data);
    });

    it('should call passwordManagerService.hashPassword', () => {
      expect(passwordManagerService.hashPassword).toHaveBeenCalledWith(
        data.password,
      );
    });

    it('should call accountsRepository.save', () => {
      expect(accountsRepository.save).toHaveBeenCalledWith({
        ...data,
        image: expect.any(String),
        password: expect.any(String),
      });
    });

    it('should call accountsRepository.findOneBy', () => {
      expect(accountsRepository.findOneBy).toHaveBeenCalledWith({
        id: accountDummy().id,
      });
    });

    it('should return account', () => {
      expect(result).toEqual(accountDummy());
    });
  });

  describe('getOneByID', () => {
    let result: SelectedAccountFields;

    describe('scenario : id is valid', function () {
      const ID = accountDummy().id;

      beforeEach(async () => {
        result = await localAccountsService.getOneByID(ID);
      });

      it('should call accountsRepository.findOne', () => {
        expect(accountsRepository.findOne).toHaveBeenCalledWith({
          where: { id: ID, via: RegisterType.LOCAL },
        });
      });

      it('should return account', () => {
        expect(result).toEqual(accountDummy());
      });
    });

    describe('scenario : id is invalid', function () {
      const ID = accountDummy().id;

      beforeEach(async () => {
        jest.spyOn(accountsRepository, 'findOne').mockResolvedValue(null);

        result = await localAccountsService.getOneByID(ID);
      });

      it('should call accountsRepository.findOne', () => {
        expect(accountsRepository.findOne).toHaveBeenCalledWith({
          where: { id: ID, via: RegisterType.LOCAL },
        });
      });

      it('should return account', () => {
        expect(result).toEqual(null);
      });
    });
  });
});
