import { randomUUID } from 'crypto';
import { RegisterType } from '../entities/account.entity';
import { EMAIL_REGISTERED } from '../../lib/api-messages/api-messages';
import { accountStub } from './stub/account.stub';
import { Account } from '../entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '../accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailsService } from 'src/mails/mails.service';
import { mockRepository } from 'src/lib/mockRepository';
import { EMAIL_TAKEN, USERNAME_TAKEN, CODE_SENT } from 'src/lib/api-messages';
import { UploadsService } from 'src/uploads/uploads.service';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';
import { Repository } from 'typeorm';

jest.mock('src/uploads/uploads.service.ts');
jest.mock('src/mails/mails.service.ts');

describe('AccountsService', () => {
  let accounstService: AccountsService;
  let accountsRepository: Repository<Account>;
  let uploadsService: UploadsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useClass: Repository,
        },
        MailsService,
        UploadsService,
      ],
    }).compile();

    accounstService = module.get<AccountsService>(AccountsService);
    accountsRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
    uploadsService = module.get<UploadsService>(UploadsService);

    mockRepository(accountsRepository, Account);
  });

  describe('getOne', () => {
    describe('when getOne is called', () => {
      let result: Account;
      let id = randomUUID();

      beforeEach(async () => {
        result = await accounstService.getOne(id);
      });

      test('calls accountsRepository.findOne method', () => {
        expect(accountsRepository.findOne).toHaveBeenCalledWith({
          where: { id },
        });
      });

      it('should return an account', () => {
        expect(result).toEqual(accountStub());
      });
    });
  });

  describe('getAccount', () => {
    let result: {
      id: string;
      username: string;
      password: string;
      display_name: string;
      email: string;
      image: string;
    };
    const account = accountStub();

    beforeEach(async () => {
      result = await accounstService.getAccount(account.email);
    });

    test('calls accountsRepository.findOne method', () => {
      expect(accountsRepository.findOne).toHaveBeenCalled();
    });

    it('should return an account', () => {
      expect(result).toEqual(account);
    });
  });

  describe('createLocalAccount', () => {
    const dto = { ...accountStub(), verification_code: '123456' };

    describe('when createLocalAccount method is called ', () => {
      describe('if : username exists in the db', () => {
        test('throws "Username taken." error', async () => {
          await expect(accounstService.createLocalAccount(dto)).rejects.toThrow(
            USERNAME_TAKEN,
          );
        });
      });

      describe('if : email exists in the db', () => {
        test('throws "Email taken." error', async () => {
          jest
            .spyOn(accounstService, 'getOneByUsername')
            .mockResolvedValueOnce(null);

          await expect(accounstService.createLocalAccount(dto)).rejects.toThrow(
            EMAIL_TAKEN,
          );
        });
      });

      describe('if: unique username and email', () => {
        let result: Account;

        beforeEach(async () => {
          jest
            .spyOn(accounstService, 'getOneByUsername')
            .mockResolvedValueOnce(null);

          jest
            .spyOn(accounstService, 'getOneByEmail')
            .mockResolvedValueOnce(null);

          result = await accounstService.createLocalAccount(dto);
        });

        it('then should return an account', () => {
          expect(result).toEqual(accountStub());
        });
      });
    });
  });

  describe('createAccountViaGoogle', () => {
    let result: Account;
    let dto = accountStub();

    beforeEach(async () => {
      result = await accounstService.createAccountViaGoogle(dto);
    });

    test('calls accountsRepository.save method', () => {
      expect(accountsRepository.save).toHaveBeenCalledWith({
        ...dto,
        via: RegisterType.GOOGLE,
      });
    });

    it('should return an account', async () => {
      expect(result).toEqual({ ...dto, via: RegisterType.GOOGLE });
    });
  });

  describe('changeProfileImage', () => {
    describe('when changeProfileImage is called', () => {
      let result: { newImage: string };
      const jwtPayload = jwtPayloadStub;
      let file: Express.Multer.File;

      beforeEach(async () => {
        result = await accounstService.changeProfileImage(jwtPayload, file);
      });

      test('calls uploadsService.uploadProfileImage', () => {
        expect(uploadsService.uploadProfileImage).toHaveBeenCalledWith(file);
      });

      test('calls accountsRepository.save with new uploaded image url', () => {
        expect(accountsRepository.save).toHaveBeenCalledWith({
          ...accountStub(),
          image: uploadProfileResultStub.newImage,
        });
      });

      it('should return a new image url which file was uploaded', () => {
        expect(result).toEqual({ newImage: expect.any(String) });
      });
    });
  });

  describe('beginRegisterVerification', () => {
    describe('when beginRegisterVerification is called', () => {
      let { username, email } = accountStub();

      describe('scenario : if email registered', () => {
        test('should throw an error', async () => {
          await expect(
            accounstService.beginRegisterVerification(username, email),
          ).rejects.toThrow(EMAIL_REGISTERED);
        });
      });

      describe('scenario : if username registered', () => {
        test('should throw an error', async () => {
          jest.spyOn(accountsRepository, 'findOne').mockResolvedValueOnce(null);

          await expect(
            accounstService.beginRegisterVerification(username, email),
          ).rejects.toThrow(USERNAME_TAKEN);
        });
      });

      describe('if unregistered credentials sent', () => {
        test('should return the message', async () => {
          jest.spyOn(accountsRepository, 'findOne').mockResolvedValue(null);

          expect(
            await accounstService.beginRegisterVerification(username, email),
          ).toEqual({ message: CODE_SENT });
        });
      });
    });
  });
});
