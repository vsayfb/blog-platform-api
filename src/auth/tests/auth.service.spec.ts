import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { AuthService } from '../auth.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { GoogleService } from 'src/google/google.service';

jest.mock('src/accounts/accounts.service');
jest.mock('src/google/google.service');

describe('AuthService', () => {
  let authService: AuthService;
  let accountsService: AccountsService;
  let googleService: GoogleService;
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
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    accountsService = module.get<AccountsService>(AccountsService);
    googleService = module.get<GoogleService>(GoogleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto: CreateAccountDto = accountStub();
    let result: Account;

    beforeEach(async () => {
      result = await authService.register(accountStub());
    });

    describe('when register method is called', () => {
      test('createLocalAccount method should be called with dto', () => {
        expect(accountsService.createLocalAccount).toHaveBeenCalledWith(dto);
      });

      it('should create an account return that', async () => {
        expect(result).toEqual({ id: expect.any(String), ...dto });
      });
    });
  });

  describe('googleAuth', () => {
    describe('when googleAuth is called', () => {
      const access_token = 'ksadjsjdidwq';
      let result: { access_token: string };
      let dto = accountStub();

      beforeEach(async () => {
        result = await authService.googleAuth(access_token);
      });

      test('getUserCredentials in google service should be called with access_token', () => {
        expect(googleService.getUserCredentials).toHaveBeenCalledWith(
          access_token,
        );
      });

      test('getAccount method should be called with email', () => {
        expect(accountsService.getAccount).toHaveBeenCalledWith(dto.email);
      });

      describe('if : registered user', () => {
        it('should return an access token', () => {
          expect(result).toEqual({ access_token: expect.any(String) });
        });
      });

      describe('if : unregistered user', () => {
        beforeEach(async () => {
          jest.spyOn(accountsService, 'getAccount').mockResolvedValueOnce(null);
          result = await authService.googleAuth(access_token);
        });

        test('createAccountViaGoogle method should be called with account', () => {
          expect(accountsService.createAccountViaGoogle).toHaveBeenCalledWith({
            email: dto.email,
            password: expect.any(String),
            username: dto.username + dto.username,
          });
        });

        it('should return an access token', () => {
          expect(result).toEqual({ access_token: expect.any(String) });
        });
      });
    });
  });

  describe('validateAccount', () => {
    const { username, email, password } = accountStub();
    let result: Account;

    describe('when validateAccount is called', () => {
      beforeEach(async () => {
        result = await authService.validateAccount(username, password);
      });

      test('getAccount method should be called with username ', () => {
        expect(accountsService.getAccount).toHaveBeenCalledWith(username);
      });

      describe('if : an account found', () => {
        it('should return the account', () => {
          expect(result).toEqual({ id: expect.any(String), username, email });
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
