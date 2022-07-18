import { randomUUID } from 'crypto';
import { RegisterType } from '../entities/account.entity';
import { accountStub } from './stub/account.stub';
import { Account } from '../entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '../accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailsService } from 'src/mails/mails.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';
import { Repository } from 'typeorm';
import { mockRepository } from '../../../test/helpers/mockRepository';
import { AccountMessages } from '../enums/account-messages';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { SelectedAccountFields } from '../types/selected-account-fields';
import { CreateAccountDto } from '../dto/create-account.dto';

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
      let result: SelectedAccountFields;
      const id = randomUUID();

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
    let result: SelectedAccountFields & { email: string; password: string };
    const account = accountStub();

    beforeEach(async () => {
      result = await accounstService.getAccount(account.username);
    });

    test('calls accountsRepository.findOne method', () => {
      expect(accountsRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            username: account.username,
          },
          {
            email: account.username,
          },
        ],
        select: {
          id: true,
          username: true,
          display_name: true,
          image: true,
          role: true,
          email: true,
          password: true,
        },
      });
    });

    it('should return an account', () => {
      expect(result).toEqual(accountStub());
    });
  });

  describe('getProfile', () => {
    const USERNAME = accountStub().username;

    describe('when getProfile is called', () => {
      let createQueryBuilder: any;

      beforeEach(() => {
        createQueryBuilder = {
          where: () => createQueryBuilder,
          leftJoinAndSelect: () => createQueryBuilder,
          leftJoin: () => createQueryBuilder,
          loadRelationCountAndMap: () => createQueryBuilder,
        };

        jest
          .spyOn(accountsRepository, 'createQueryBuilder' as any)
          .mockImplementation(() => createQueryBuilder);
      });

      describe('scenario : an account not found with given username', () => {
        test('should throw Account not found error', async () => {
          createQueryBuilder.getOne = () => null;

          await expect(accounstService.getProfile(USERNAME)).rejects.toThrow(
            AccountMessages.NOT_FOUND,
          );
        });
      });

      describe('scenario : an account found with given username', () => {
        test('should return to the found account', async () => {
          createQueryBuilder.getOne = () => accountStub();

          await expect(accounstService.getProfile(USERNAME)).resolves.toEqual(
            accountStub(),
          );
        });
      });
    });
  });

  describe('createLocalAccount', () => {
    const dto: CreateAccountDto = {
      ...accountStub(),
      verification_code: '123456',
      email: 'foo@gmail.com',
      password: 'foo_password',
    };

    describe('when createLocalAccount method is called ', () => {
      describe('if : username exists in the db', () => {
        test('throws "Username taken." error', async () => {
          await expect(accounstService.createLocalAccount(dto)).rejects.toThrow(
            AccountMessages.USERNAME_TAKEN,
          );
        });
      });

      describe('if : email exists in the db', () => {
        test('throws "Email taken." error', async () => {
          jest
            .spyOn(accounstService, 'getOneByUsername')
            .mockResolvedValueOnce(null);

          await expect(accounstService.createLocalAccount(dto)).rejects.toThrow(
            AccountMessages.EMAIL_TAKEN,
          );
        });
      });

      describe('if: unique username and email', () => {
        let result: SelectedAccountFields;

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
    let result: SelectedAccountFields;
    const dto = accountStub();

    beforeEach(async () => {
      result = await accounstService.createAccountViaGoogle({
        ...dto,
        password: 'foo_password',
        email: 'foo@gmail.com',
      });
    });

    it('should return an account', async () => {
      expect(result).toEqual(accountStub());
    });
  });

  describe('changeProfileImage', () => {
    describe('when changeProfileImage is called', () => {
      let result: { newImage: string };
      const account = jwtPayloadStub();
      let file: Express.Multer.File;

      beforeEach(async () => {
        result = await accounstService.changeProfileImage(account, file);
      });

      test('calls uploadsService.uploadProfileImage', () => {
        expect(uploadsService.uploadProfileImage).toHaveBeenCalledWith(file);
      });

      test('calls accountsRepository.save with new uploaded image url', () => {
        expect(accountsRepository.save).toHaveBeenCalledWith({
          ...accountStub(),
          image: uploadProfileResultStub().newImage,
        });
      });

      it('should return a new image url which file was uploaded', () => {
        expect(result).toEqual({ newImage: expect.any(String) });
      });
    });
  });

  describe('beginRegisterVerification', () => {
    describe('when beginRegisterVerification is called', () => {
      const account = accountStub();
      const accountEmail = 'foo@gmail.com';

      describe('scenario : if email registered', () => {
        test('should throw email taken error', async () => {
          await expect(
            accounstService.beginRegisterVerification(
              account.username,
              accountEmail,
            ),
          ).rejects.toThrow(AccountMessages.EMAIL_TAKEN);
        });
      });

      describe('scenario : if username registered', () => {
        test('should throw username taken error', async () => {
          jest.spyOn(accountsRepository, 'findOne').mockResolvedValueOnce(null);

          await expect(
            accounstService.beginRegisterVerification(
              account.username,
              accountEmail,
            ),
          ).rejects.toThrow(AccountMessages.USERNAME_TAKEN);
        });
      });

      describe('if unregistered credentials sent', () => {
        test('should return the message', async () => {
          jest.spyOn(accountsRepository, 'findOne').mockResolvedValue(null);

          expect(
            await accounstService.beginRegisterVerification(
              account.username,
              accountEmail,
            ),
          ).toEqual({ message: CodeMessages.CODE_SENT });
        });
      });
    });
  });
});
