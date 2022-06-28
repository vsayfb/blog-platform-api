import { EMAIL_REGISTERED } from './../../lib/api-messages/api-messages';
import { accountStub } from './stub/account.stub';
import { Account } from '../entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '../accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailsService } from 'src/mails/mails.service';
import { mockRepository } from 'src/lib/mockRepository';
import { EMAIL_TAKEN, USERNAME_TAKEN, CODE_SENT } from 'src/lib/api-messages';
import { UploadsService } from 'src/uploads/uploads.service';
import { ForbiddenException } from '@nestjs/common';

jest.mock('src/uploads/uploads.service.ts');
jest.mock('src/mails/mails.service.ts');

describe('AccountsService', () => {
  let accounstService: AccountsService;
  let uploadsService: UploadsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository,
        },
        MailsService,
        UploadsService,
      ],
    }).compile();

    accounstService = module.get<AccountsService>(AccountsService);
    uploadsService = module.get<UploadsService>(UploadsService);
  });

  describe('createLocalAccount method', () => {
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
          expect(result).toEqual({
            id: expect.any(String),
            ...dto,
          });
        });
      });
    });
  });

  describe('beginRegisterVerification method', () => {
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
          jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(null);

          await expect(
            accounstService.beginRegisterVerification(username, email),
          ).rejects.toThrow(USERNAME_TAKEN);
        });
      });

      describe('if unregistered credentials sent', () => {
        test('should return the message', async () => {
          jest.spyOn(mockRepository, 'findOne').mockResolvedValue(null);

          expect(
            await accounstService.beginRegisterVerification(username, email),
          ).toEqual({ message: CODE_SENT });
        });
      });
    });
  });
});
