import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { AuthService } from '../auth.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { GoogleService } from 'src/apis/google/google.service';
import { ForbiddenException } from '@nestjs/common';
import { CodesService } from 'src/codes/codes.service';
import { RegisterViewDto } from 'src/accounts/dto/register-view.dto';
import { CodeMessages } from 'src/codes/enums/code-messages';

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
    const dto = { ...accountStub(), verification_code: '21345' };

    let result: RegisterViewDto | ForbiddenException;

    beforeEach(async () => {
      result = await authService.register(dto);
    });

    describe('when register method is called', () => {
      test('calls codesService.getCode', () => {
        expect(codesService.getCode).toHaveBeenCalledWith(
          dto.verification_code,
        );
      });

      describe('if : code is null', () => {
        test('register method throws an error', async () => {
          jest.spyOn(codesService, 'getCode').mockResolvedValueOnce(null);

          await expect(authService.register(dto)).rejects.toThrow(
            CodeMessages.INVALID_CODE,
          );
        });
      });

      describe('if : code is verified', () => {
        test('calls codesService.removeCode', () => {
          expect(codesService.removeCode).toHaveBeenCalled();
        });

        test('calls accountsService.createLocalAccount', () => {
          expect(accountsService.createLocalAccount).toHaveBeenCalled();
        });

        it('should create an account and return access_token', async () => {
          expect(result).toMatchObject({
            data: expect.anything(),
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
      const dto = accountStub();

      beforeEach(async () => {
        result = await authService.googleAuth(access_token);
      });

      test('calls googleService.getUserCredentials', () => {
        expect(googleService.getUserCredentials).toHaveBeenCalledWith(
          access_token,
        );
      });

      test('calls accountsService.getAccount', () => {
        expect(accountsService.getAccount).toHaveBeenCalledWith(dto.email);
      });

      describe('if : registered user', () => {
        it('should return an access token and an account', () => {
          expect(result).toMatchObject({
            data: expect.anything(),
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
            email: dto.email,
            password: expect.any(String),
            username: dto.username + dto.username,
            display_name: dto.username + ' ' + dto.username,
          });
        });

        it('should return an access token and an account', () => {
          expect(result).toMatchObject({
            data: expect.anything(),
            access_token: expect.any(String),
          });
        });
      });
    });
  });

  describe('validateAccount', () => {
    const { username, password } = accountStub();
    let result: Account;

    describe('when validateAccount is called', () => {
      beforeEach(async () => {
        result = await authService.validateAccount(username, password);
      });

      test('calls accountsService.getAccount', () => {
        expect(accountsService.getAccount).toHaveBeenCalledWith(username);
      });

      describe('if : an account found', () => {
        it('should return the account', () => {
          expect(result).toEqual({
            id: expect.any(String),
            ...result,
          });
        });
      });

      describe('if : an account not found', () => {
        it('should return null', async () => {
          jest.spyOn(accountsService, 'getAccount').mockResolvedValueOnce(null);

          result = await authService.validateAccount(username, password);

          expect(result).toEqual(null);
        });
      });
    });
  });
});
