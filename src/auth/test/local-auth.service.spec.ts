import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { LocalAuthService } from '../services/local-auth.service';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { CodesService } from 'src/verification_codes/verification-codes.service';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { RegisterViewDto } from '../dto/register-view.dto';
import { CreateAccountDto } from 'src/accounts/request-dto/create-account.dto';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { codeStub } from 'src/verification_codes/stub/code.stub';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { PasswordManagerService } from 'src/accounts/services/password-manager.service';
import { MailsService } from 'src/mails/mails.service';
import { registerPayloadStub } from '../stub/register-payload.stub';

jest.mock('src/accounts/services/accounts.service');
jest.mock('src/accounts/services/password-manager.service');
jest.mock('src/codes/codes.service');
jest.mock('src/mails/mails.service');
jest.mock('src/apis/google/google.service');

describe('LocalAuthService', () => {
  let localAuthService: LocalAuthService;
  let accountsService: AccountsService;
  let codesService: CodesService;
  let passwordManagerService: PasswordManagerService;
  let mailsService: MailsService;

  const mockJwtService = {
    sign: jest.fn().mockImplementation(() => ''),
  };
  const mockConfigService = { get: jest.fn(() => '') };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LocalAuthService,
        AccountsService,
        CodesService,
        MailsService,
        PasswordManagerService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    localAuthService = module.get<LocalAuthService>(LocalAuthService);
    accountsService = module.get<AccountsService>(AccountsService);
    mailsService = module.get<MailsService>(MailsService);
    codesService = module.get<CodesService>(CodesService);
    passwordManagerService = module.get<PasswordManagerService>(
      PasswordManagerService,
    );
  });

  describe('register', () => {
    describe('when register is called', () => {
      const dto: CreateAccountDto = {
        verification_code: '21345',
        email: 'foo@gmail.com',
        password: 'foo_password',
        username: accountStub().username,
        display_name: accountStub().display_name,
      };

      describe('scenario : if code is null', () => {
        test('register method throws an error', async () => {
          jest.spyOn(codesService, 'getCode').mockResolvedValueOnce(null);

          await expect(localAuthService.register(dto)).rejects.toThrow(
            CodeMessages.INVALID_CODE,
          );
        });
      });

      describe('scenario : if email is invalid', () => {
        test('register method throws Invalid Email', async () => {
          await expect(localAuthService.register(dto)).rejects.toThrow(
            AccountMessages.INVALID_EMAIL,
          );
        });
      });

      describe('scenario : all conditions are meet', () => {
        let result: RegisterViewDto;

        beforeEach(async () => {
          jest.spyOn(codesService, 'getCode').mockResolvedValueOnce({
            ...codeStub(),
            receiver: 'foo@gmail.com',
          });

          result = await localAuthService.register(dto);
        });

        test('calls codesService.delete', () => {
          expect(codesService.delete).toHaveBeenCalledWith(codeStub().id);
        });

        test('shold return the credentials', () => {
          expect(result).toEqual(registerPayloadStub());
        });
      });
    });
  });

  describe('validateAccount', () => {
    const { username } = accountStub();
    const accountPassword = 'foo_password';

    describe('when validateAccount is called', () => {
      describe('scenario : an account was not found', () => {
        let result: SelectedAccountFields;

        beforeEach(async () => {
          jest.spyOn(accountsService, 'getAccount').mockResolvedValueOnce(null);

          result = await localAuthService.validateAccount(
            username,
            accountPassword,
          );
        });

        it('should return null', async () => {
          expect(result).toEqual(null);
        });
      });

      describe('scenario : an account was found and passwords do not match', () => {
        let result: SelectedAccountFields;

        beforeEach(async () => {
          jest
            .spyOn(passwordManagerService, 'comparePassword')
            .mockResolvedValueOnce(false);

          result = await localAuthService.validateAccount(
            username,
            accountPassword,
          );
        });

        test('calls accountsService.getAccount', () => {
          expect(accountsService.getAccount).toHaveBeenCalledWith(username);
        });

        it('should return null', async () => {
          expect(result).toEqual(null);
        });
      });

      describe('scenario : an account was found and passwords match', () => {
        let result: SelectedAccountFields;

        beforeEach(async () => {
          result = await localAuthService.validateAccount(
            username,
            accountPassword,
          );
        });

        test('calls accountsService.getAccount', () => {
          expect(accountsService.getAccount).toHaveBeenCalledWith(username);
        });

        it('should return the account', () => {
          expect(result).toEqual(accountStub());
        });
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
            localAuthService.beginRegisterVerification(
              account.username,
              accountEmail,
            ),
          ).rejects.toThrow(AccountMessages.EMAIL_TAKEN);
        });
      });

      describe('scenario : if username registered', () => {
        test('should throw username taken error', async () => {
          jest
            .spyOn(accountsService, 'getOneByEmail')
            .mockResolvedValueOnce(null);

          await expect(
            localAuthService.beginRegisterVerification(
              account.username,
              accountEmail,
            ),
          ).rejects.toThrow(AccountMessages.USERNAME_TAKEN);
        });
      });

      describe('if unregistered credentials sent', () => {
        let result: { message: string };

        beforeEach(async () => {
          jest
            .spyOn(accountsService, 'getOneByUsername')
            .mockResolvedValue(null);

          jest.spyOn(accountsService, 'getOneByEmail').mockResolvedValue(null);

          result = await localAuthService.beginRegisterVerification(
            account.username,
            accountEmail,
          );
        });

        test('calls mailService.sendVerificationCode', () => {
          expect(mailsService.sendVerificationCode).toHaveBeenCalledWith({
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
});
