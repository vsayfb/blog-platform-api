import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { AuthService } from '../auth.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { GoogleService } from 'src/apis/google/google.service';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { RegisterViewDto } from '../dto/register-view.dto';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { codeStub } from 'src/codes/stub/code.stub';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { googleUserCredentialsStub } from 'src/apis/google/stub/google-credentials.stub';
import { Account } from 'src/accounts/entities/account.entity';

jest.mock('src/accounts/accounts.service');
jest.mock('src/codes/codes.service');
jest.mock('src/apis/google/google.service');

describe('AuthService', () => {
  let authService: AuthService;
  let accountsService: AccountsService;
  let googleService: GoogleService;
  let codesService: CodesService;

  const mockJwtService = {
    sign: jest.fn().mockImplementation(() => ''),
  };
  const mockConfigService = { get: jest.fn(() => '') };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        AccountsService,
        GoogleService,
        CodesService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    accountsService = module.get<AccountsService>(AccountsService);
    googleService = module.get<GoogleService>(GoogleService);
    codesService = module.get<CodesService>(CodesService);
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

          await expect(authService.register(dto)).rejects.toThrow(
            CodeMessages.INVALID_CODE,
          );
        });
      });

      describe('scenario : if email is invalid', () => {
        test('register method throws Invalid Email', async () => {
          await expect(authService.register(dto)).rejects.toThrow(
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

          result = await authService.register(dto);
        });

        test('calls codesService.delete', () => {
          expect(codesService.delete).toHaveBeenCalledWith(codeStub().id);
        });

        test('shold return account and access token', () => {
          expect(result).toEqual({
            data: accountStub(),
            access_token: expect.any(String),
          });
        });
      });
    });
  });

  describe('googleAuth', () => {
    describe('when googleAuth is called', () => {
      const access_token = 'ksadjsjdidwq';
      let result: RegisterViewDto;

      beforeEach(async () => {
        result = await authService.googleAuth(access_token);
      });

      test('calls googleService.getUserCredentials', () => {
        expect(googleService.getUserCredentials).toHaveBeenCalledWith(
          access_token,
        );
      });

      test('calls accountsService.getAccount', () => {
        expect(accountsService.getAccount).toHaveBeenCalledWith(
          googleUserCredentialsStub().email,
        );
      });

      describe('if : registered user', () => {
        it('should return an access token and an account', () => {
          expect(result).toEqual({
            data: accountStub(),
            access_token: expect.any(String),
          });
        });
      });

      describe('if : unregistered user', () => {
        beforeEach(async () => {
          jest.spyOn(accountsService, 'getAccount').mockResolvedValueOnce(null);
          result = await authService.googleAuth(access_token);
        });

        test('calls accountsService.createAccountViaGoogle', () => {
          expect(accountsService.createAccountViaGoogle).toHaveBeenCalledWith({
            email: googleUserCredentialsStub().email,
            password: expect.any(String),
            username:
              googleUserCredentialsStub().given_name +
              googleUserCredentialsStub().family_name,
            display_name:
              googleUserCredentialsStub().given_name +
              ' ' +
              googleUserCredentialsStub().family_name,
          });
        });

        it('should return an access token and an account', () => {
          expect(result).toEqual({
            data: expect.anything(),
            access_token: expect.any(String),
          });
        });
      });
    });
  });

  describe('validateAccount', () => {
    const { username } = accountStub();
    const accountPassword = 'foo_password';

    describe('when validateAccount is called', () => {
      describe('if : an account was found and passwords matched', () => {
        let result: SelectedAccountFields;

        beforeEach(async () => {
          // return same password
          jest.spyOn(accountsService, 'getAccount').mockResolvedValueOnce({
            ...accountStub(),
            password: accountPassword,
          } as Account);

          result = await authService.validateAccount(username, accountPassword);
        });

        test('calls accountsService.getAccount', () => {
          expect(accountsService.getAccount).toHaveBeenCalledWith(username);
        });

        it('should return the account', () => {
          expect(result).toEqual(accountStub());
        });
      });

      describe('if : an account was not found or passwords do not match', () => {
        let result: SelectedAccountFields;

        beforeEach(async () => {
          result = await authService.validateAccount(username, accountPassword);
        });

        test('calls accountsService.getAccount', () => {
          expect(accountsService.getAccount).toHaveBeenCalledWith(username);
        });

        it('should return null', async () => {
          expect(result).toEqual(null);
        });
      });
    });
  });
});
