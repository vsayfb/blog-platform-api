import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { RegisterViewDto } from '../dto/register-view.dto';
import { GoogleAuthService } from '../services/google-auth.service';
import { GoogleAccountsService } from 'src/accounts/services/google-accounts.service';
import { GoogleService } from 'src/apis/google/google.service';
import { googleUserCredentialsStub } from 'src/apis/google/stub/google-credentials.stub';
import { registerPayloadStub } from '../stub/register-payload.stub';
import { PasswordManagerService } from 'src/accounts/services/password-manager.service';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';

jest.mock('src/accounts/services/google-accounts.service');
jest.mock('src/accounts/services/password-manager.service');
jest.mock('src/apis/google/google.service');

describe('GoogleAuthService', () => {
  let googleAuthService: GoogleAuthService;
  let googleAccountsService: GoogleAccountsService;
  let googleService: GoogleService;
  let passwordManagerService: PasswordManagerService;

  const mockJwtService = {
    sign: jest.fn().mockImplementation(() => ''),
  };
  const mockConfigService = { get: jest.fn(() => '') };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GoogleAuthService,
        GoogleAccountsService,
        GoogleService,
        PasswordManagerService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    googleAuthService = module.get<GoogleAuthService>(GoogleAuthService);
    googleAccountsService = module.get<GoogleAccountsService>(
      GoogleAccountsService,
    );
    googleService = module.get<GoogleService>(GoogleService);
    passwordManagerService = module.get<PasswordManagerService>(
      PasswordManagerService,
    );
  });

  describe('register', () => {
    describe('when register is called', () => {
      const access_token = '';

      let result: RegisterViewDto;

      beforeEach(async () => {
        result = await googleAuthService.register(access_token);
      });

      test('calls googleService.getUserCredentials', () => {
        expect(googleService.getUserCredentials).toHaveBeenCalledWith(
          access_token,
        );
      });

      test('calls googleAccountsService.create', () => {
        expect(googleAccountsService.create).toHaveBeenCalledWith(
          googleUserCredentialsStub(),
        );
      });

      it('should return the created account and access_token', () => {
        expect(result).toEqual(registerPayloadStub());
      });
    });
  });

  describe('validateAccount', () => {
    const token = '';

    describe('when validateAccount is called', () => {
      describe('scenario : a google account was not found with given token', () => {
        let result: SelectedAccountFields;
        const token = '';

        beforeEach(async () => {
          jest
            .spyOn(googleService, 'getUserCredentials')
            .mockResolvedValueOnce(null);

          result = await googleAuthService.validateAccount(token);
        });

        test('calls googleService.getUserCredentials', () => {
          expect(googleService.getUserCredentials).toHaveBeenCalledWith(token);
        });

        it('should return null', async () => {
          expect(result).toEqual(null);
        });
      });

      describe('scenario : a google account was found with given email', () => {
        const email = googleUserCredentialsStub().email;
        let result: SelectedAccountFields | null;

        beforeEach(async () => {
          jest
            .spyOn(googleAccountsService, 'getOneByEmail')
            .mockResolvedValueOnce(null);

          result = await googleAuthService.validateAccount(token);
        });

        test('calls googleAccountsService.getOneByEmail', () => {
          expect(googleAccountsService.getOneByEmail).toHaveBeenCalledWith(
            email,
          );
        });

        it('should return null', async () => {
          expect(result).toEqual(null);
        });
      });

      describe('scenario : a google account was found with given credentials', () => {
        let result: SelectedAccountFields;
        const token = '';

        beforeEach(async () => {
          result = await googleAuthService.validateAccount(token);
        });

        test('calls googleService.getUserCredentials', () => {
          expect(googleService.getUserCredentials).toHaveBeenCalledWith(token);
        });

        test('calls googleAccountsService.getOneByEmail', () => {
          expect(googleAccountsService.getOneByEmail).toHaveBeenCalledWith(
            googleUserCredentialsStub().email,
          );
        });

        it('should return the account', () => {
          expect(result).toEqual(accountStub());
        });
      });
    });
  });
});
