import { Test } from '@nestjs/testing';
import { TemporaryAccountsService } from '../../temporary-accounts.service';
import { TemporaryAccount } from '../../../entities/temporary-account.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mockRepository } from '../../../../../../test/helpers/utils/mockRepository';
import { accountDummy } from '../../../dummy/accountDummy';
import { CreateLocalAccount } from '../../../../../auth/types/create-local-account';

describe('TemporaryAccountsService', () => {
  let temporaryAccountsService: TemporaryAccountsService;
  let temporaryAccountsRepository: Repository<TemporaryAccount>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TemporaryAccountsService,
        {
          provide: getRepositoryToken(TemporaryAccount),
          useClass: Repository,
        },
      ],
    }).compile();

    temporaryAccountsService = moduleRef.get(TemporaryAccountsService);

    temporaryAccountsRepository = moduleRef.get(
      getRepositoryToken(TemporaryAccount),
    );

    mockRepository(temporaryAccountsRepository, TemporaryAccount);
  });

  describe('getOneByID', () => {
    let result: TemporaryAccount;

    describe('scenario : id is valid', function () {
      const ID = accountDummy().id;

      beforeEach(async () => {
        result = await temporaryAccountsService.getOneByID(ID);
      });

      it('should call temporaryAccountsRepository.findOneBy', () => {
        expect(temporaryAccountsRepository.findOneBy).toHaveBeenCalledWith({
          id: ID,
        });
      });

      it('should return account', () => {
        expect(result).toEqual(accountDummy());
      });
    });

    describe('scenario : id is invalid', function () {
      const ID = accountDummy().id;

      beforeEach(async () => {
        jest
          .spyOn(temporaryAccountsRepository, 'findOneBy')
          .mockResolvedValueOnce(null);

        result = await temporaryAccountsService.getOneByID(ID);
      });

      it('should call temporaryAccountsRepository.findOneBy', () => {
        expect(temporaryAccountsRepository.findOneBy).toHaveBeenCalledWith({
          id: ID,
        });
      });

      it('should return null', () => {
        expect(result).toEqual(null);
      });
    });
  });

  describe('getAll', () => {
    let result: TemporaryAccount[];

    beforeEach(async () => {
      result = await temporaryAccountsService.getAll();
    });

    it('should call temporaryAccountsRepository.find', () => {
      expect(temporaryAccountsRepository.find).toHaveBeenCalled();
    });

    it('should return accounts', () => {
      expect(result).toEqual([accountDummy()]);
    });
  });

  describe('create', () => {
    const data: CreateLocalAccount = {
      ...accountDummy(),
    };

    let result;

    beforeEach(async () => {
      result = await temporaryAccountsService.create(data);
    });

    it('should call temporaryAccountsRepository.save', () => {
      expect(temporaryAccountsRepository.save).toHaveBeenCalledWith(data);
    });

    it('should return account', () => {
      expect(result).toEqual(accountDummy());
    });
  });

  describe('getOneByEmailOrMobilePhone', () => {
    const value = accountDummy().email;

    let result;

    describe('scenario : value is valid', () => {
      beforeEach(async () => {
        result = await temporaryAccountsService.getOneByEmailOrMobilePhone(
          value,
        );
      });

      it('should call temporaryAccountsRepository.findOneBy', () => {
        expect(temporaryAccountsRepository.findOneBy).toHaveBeenCalledWith([
          { email: value },
          { mobile_phone: value },
        ]);
      });

      it('should return account', () => {
        expect(result).toEqual(accountDummy());
      });
    });

    describe('scenario : value is invalid', () => {
      beforeEach(async () => {
        jest
          .spyOn(temporaryAccountsRepository, 'findOneBy')
          .mockResolvedValueOnce(null);

        result = await temporaryAccountsService.getOneByEmailOrMobilePhone(
          value,
        );
      });

      it('should call temporaryAccountsRepository.findOneBy', () => {
        expect(temporaryAccountsRepository.findOneBy).toHaveBeenCalledWith([
          { email: value },
          { mobile_phone: value },
        ]);
      });

      it('should return null', () => {
        expect(result).toEqual(null);
      });
    });
  });

  describe('getOneByEmail', () => {
    const email = accountDummy().email;

    let result;

    describe('scenario : email is valid', () => {
      beforeEach(async () => {
        result = await temporaryAccountsService.getOneByEmail(email);
      });

      it('should call temporaryAccountsRepository.findOneBy', () => {
        expect(temporaryAccountsRepository.findOneBy).toHaveBeenCalledWith({
          email,
        });
      });

      it('should return account', () => {
        expect(result).toEqual(accountDummy());
      });
    });

    describe('scenario : email is invalid', () => {
      beforeEach(async () => {
        jest
          .spyOn(temporaryAccountsRepository, 'findOneBy')
          .mockResolvedValueOnce(null);

        result = await temporaryAccountsService.getOneByEmail(email);
      });

      it('should call temporaryAccountsRepository.findOneBy', () => {
        expect(temporaryAccountsRepository.findOneBy).toHaveBeenCalledWith({
          email,
        });
      });

      it('should return null', () => {
        expect(result).toEqual(null);
      });
    });
  });

  describe('getOneByUsername', () => {
    const username = accountDummy().email;

    let result;

    describe('scenario : email is valid', () => {
      beforeEach(async () => {
        result = await temporaryAccountsService.getOneByUsername(username);
      });

      it('should call temporaryAccountsRepository.findOneBy', () => {
        expect(temporaryAccountsRepository.findOneBy).toHaveBeenCalledWith({
          username,
        });
      });

      it('should return account', () => {
        expect(result).toEqual(accountDummy());
      });
    });

    describe('scenario : username is invalid', () => {
      beforeEach(async () => {
        jest
          .spyOn(temporaryAccountsRepository, 'findOneBy')
          .mockResolvedValueOnce(null);

        result = await temporaryAccountsService.getOneByUsername(username);
      });

      it('should call temporaryAccountsRepository.findOneBy', () => {
        expect(temporaryAccountsRepository.findOneBy).toHaveBeenCalledWith({
          username,
        });
      });

      it('should return null', () => {
        expect(result).toEqual(null);
      });
    });
  });

  describe('getOneByMobilePhone', () => {
    const mobilePhone = accountDummy().email;

    let result;

    describe('scenario : mobilePhone is valid', () => {
      beforeEach(async () => {
        result = await temporaryAccountsService.getOneByMobilePhone(
          mobilePhone,
        );
      });

      it('should call temporaryAccountsRepository.findOneBy', () => {
        expect(temporaryAccountsRepository.findOneBy).toHaveBeenCalledWith({
          mobile_phone: mobilePhone,
        });
      });

      it('should return account', () => {
        expect(result).toEqual(accountDummy());
      });
    });

    describe('scenario : mobilePhone is invalid', () => {
      beforeEach(async () => {
        jest
          .spyOn(temporaryAccountsRepository, 'findOneBy')
          .mockResolvedValueOnce(null);

        result = await temporaryAccountsService.getOneByMobilePhone(
          mobilePhone,
        );
      });

      it('should call temporaryAccountsRepository.findOneBy', () => {
        expect(temporaryAccountsRepository.findOneBy).toHaveBeenCalledWith({
          mobile_phone: mobilePhone,
        });
      });

      it('should return null', () => {
        expect(result).toEqual(null);
      });
    });
  });

  describe('deleteByUsernameIfExist', () => {
    const username = accountDummy().username;

    let result;

    describe('scenario : username is valid', () => {
      beforeEach(async () => {
        result = await temporaryAccountsService.deleteByUsernameIfExist(
          username,
        );
      });

      it('should call tempAccountsRepository.remove', () => {
        expect(temporaryAccountsRepository.remove).toHaveBeenCalledWith(
          accountDummy(),
        );
      });

      it('should return true', () => {
        expect(result).toEqual(true);
      });
    });

    describe('scenario : username is invalid', () => {
      beforeEach(async () => {
        jest
          .spyOn(temporaryAccountsService, 'getOneByUsername')
          .mockResolvedValueOnce(null);

        result = await temporaryAccountsService.deleteByUsernameIfExist(
          username,
        );
      });

      it('should return void', () => {
        expect(result).toEqual(undefined);
      });
    });
  });

  describe('delete', () => {
    const data = accountDummy() as TemporaryAccount;

    let result;

    beforeEach(async () => {
      result = await temporaryAccountsService.delete(data);
    });

    it('should call temporaryAccountsRepository.remove', () => {
      expect(temporaryAccountsRepository.remove).toHaveBeenCalledWith(data);
    });

    it('should return removed account ID', () => {
      expect(result).toEqual(data.id);
    });
  });
});
