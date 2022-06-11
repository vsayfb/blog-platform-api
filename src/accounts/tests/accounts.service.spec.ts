import { accountStub } from './stub/account.stub';
import { Account } from './../entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '../accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailsService } from 'src/mails/mails.service';
import { mockRepository } from 'src/helpers/mockRepository';

describe('AccountsService', () => {
  let accounstService: AccountsService;

  const mailService = {
    sendMail: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository,
        },
        {
          provide: MailsService,
          useValue: mailService,
        },
      ],
    }).compile();

    accounstService = module.get<AccountsService>(AccountsService);
  });

  describe('createLocalAccount method', () => {
    const dto = { ...accountStub(), verification_code: '123456' };

    describe('when createLocalAccount method is called ', () => {
      describe('if : username exists in the db', () => {
        test('throws "Username taken." error', async () => {
          await expect(accounstService.createLocalAccount(dto)).rejects.toThrow(
            'Username taken.',
          );
        });
      });

      describe('if : email exists in the db', () => {
        test('throws "Email taken." error', async () => {
          jest
            .spyOn(accounstService, 'getOneByUsername')
            .mockResolvedValueOnce(null);

          await expect(accounstService.createLocalAccount(dto)).rejects.toThrow(
            'Email taken.',
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
          delete dto.verification_code;

          expect(result).toEqual({ id: expect.any(String), ...dto });
        });
      });
    });
  });
});
