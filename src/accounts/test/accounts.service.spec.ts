import { randomUUID } from 'crypto';
import { accountStub } from './stub/account.stub';
import { Account } from '../entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '../services/accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailsService } from 'src/mails/mails.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';
import { Like, Repository } from 'typeorm';
import { mockRepository } from '../../../test/helpers/utils/mockRepository';
import { AccountMessages } from '../enums/account-messages';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { SelectedAccountFields } from '../types/selected-account-fields';
import { CreateAccountDto } from '../dto/create-account.dto';
import { PasswordManagerService } from '../services/password-manager.service';
import { hashStub } from 'src/global/hash-manager/test/stub/hash.stub';

jest.mock('src/uploads/uploads.service.ts');
jest.mock('src/mails/mails.service.ts');
jest.mock('../services/password-manager.service.ts');

describe('AccountsService', () => {
  let accounstService: AccountsService;
  let accountsRepository: Repository<Account>;
  let uploadsService: UploadsService;
  let mailService: MailsService;
  let passwordManagerService: PasswordManagerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        PasswordManagerService,
        MailsService,
        UploadsService,
        {
          provide: getRepositoryToken(Account),
          useClass: Repository,
        },
      ],
    }).compile();

    accounstService = module.get<AccountsService>(AccountsService);
    accountsRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
    uploadsService = module.get<UploadsService>(UploadsService);
    mailService = module.get<MailsService>(MailsService);
    passwordManagerService = module.get<PasswordManagerService>(
      PasswordManagerService,
    );

    mockRepository(accountsRepository, Account);
  });

  describe('getOneByID', () => {
    describe('when getOneByID is called', () => {
      let result: SelectedAccountFields;
      const id = randomUUID();

      beforeEach(async () => {
        result = await accounstService.getOneByID(id);
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

        test('calls passwordManager.hash method', () => {
          expect(passwordManagerService.hashPassword).toHaveBeenCalledWith(
            dto.password,
          );
        });

        test('calls accountsRepository.save method', () => {
          expect(accountsRepository.save).toHaveBeenCalledWith({
            ...dto,
            password: hashStub().hashedText,
          });
        });

        it('then should return an account', () => {
          expect(result).toEqual(accountStub());
        });
      });
    });
  });

  describe('createAccountViaGoogle', () => {
    let result: SelectedAccountFields;

    const dto: CreateAccountDto = {
      ...accountStub(),
      email: 'foo@gmail.com',
      password: 'foo_password',
    };

    beforeEach(async () => {
      result = await accounstService.createAccountViaGoogle({
        ...dto,
        password: 'foo_password',
        email: 'foo@gmail.com',
      });
    });

    test('calls passwordManager.hash method', () => {
      expect(passwordManagerService.hashPassword).toHaveBeenCalledWith(
        dto.password,
      );
    });

    test('calls accountsRepository.save method', () => {
      expect(accountsRepository.save).toHaveBeenCalledWith({
        ...dto,
        password: hashStub().hashedText,
      });
    });

    it('should return an account', async () => {
      expect(result).toEqual(accountStub());
    });
  });

  describe('changeProfileImage', () => {
    describe('when changeProfileImage is called', () => {
      let result: string;
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
        expect(result).toEqual(expect.any(String));
      });
    });
  });

  describe('beginLocalRegisterVerification', () => {
    describe('when beginLocalRegisterVerification is called', () => {
      const account = accountStub();
      const accountEmail = 'foo@gmail.com';

      describe('scenario : if email registered', () => {
        test('should throw email taken error', async () => {
          await expect(
            accounstService.beginLocalRegisterVerification(
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
            accounstService.beginLocalRegisterVerification(
              account.username,
              accountEmail,
            ),
          ).rejects.toThrow(AccountMessages.USERNAME_TAKEN);
        });
      });

      describe('if unregistered credentials sent', () => {
        let result: { message: string };

        beforeEach(async () => {
          jest.spyOn(accountsRepository, 'findOne').mockResolvedValue(null);

          result = await accounstService.beginLocalRegisterVerification(
            account.username,
            accountEmail,
          );
        });

        test('calls mailService.sendVerificationCode', () => {
          expect(mailService.sendVerificationCode).toHaveBeenCalledWith({
            username: account.username,
            email: accountEmail,
          });
        });

        test('should return the message', async () => {
          expect(result).toEqual({ message: CodeMessages.CODE_SENT });
        });
      });
    });
  });

  describe('searchByUsername', () => {
    describe('when searchByUsername is called', () => {
      let result: SelectedAccountFields[];
      const username = accountStub().username;

      beforeEach(async () => {
        result = await accounstService.searchByUsername(username);
      });

      test('calls accountsRepository.findOne method', () => {
        expect(accountsRepository.find).toHaveBeenCalledWith({
          where: { username: Like(`%${username}%`) },
          take: 10,
        });
      });

      it('should return an array af accounts', () => {
        expect(result).toEqual([accountStub()]);
      });
    });
  });
});
