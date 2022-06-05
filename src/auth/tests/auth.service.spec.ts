import { resultAccountStub } from './../../accounts/tests/stub/account.stub';
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
        JwtService,
        ConfigService,
      ],
    })
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

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

    test('calls createLocalAccount method', () => {
      expect(accountsService.createLocalAccount).toHaveBeenCalledTimes(1);
      expect(accountsService.createLocalAccount).toHaveBeenCalledWith(dto);
    });

    it('should create an account return that', async () => {
      expect(result).toEqual({ id: expect.any(String), ...dto });
    });
  });

  describe.only('googleAuth', () => {
    const access_token = 'ksadjsjdıdwq';
    let result: { access_token: string };

    beforeEach(async () => {
      result = await authService.googleAuth(access_token);
    });

    test('calls getUserCredentials', () => {
      expect(googleService.getUserCredentials).toHaveBeenCalledTimes(1);
      expect(googleService.getUserCredentials).toHaveBeenCalledWith(
        access_token,
      );
    });

    test('calls getAccount two times', () => {
      expect(accountsService.getAccount).toHaveBeenCalledTimes(2);
      expect(accountsService.getAccount).toHaveBeenCalledWith(
        accountStub().email,
      );
    });

    test('should return an access token', () => {
      expect(result).toEqual({ access_token: expect.any(String) });
    });
  });

  describe('login', () => {
    const dto = resultAccountStub();
    let result: { access_token: string };

    beforeEach(async () => {
      result = await authService.login(dto);
    });

    test('calls sign method', () => {
      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: dto.id, username: dto.username },
        { secret: '' },
      );
    });

    test('calls get method', () => {
      expect(mockConfigService.get).toHaveBeenCalledTimes(1);
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should return an access token', () => {
      expect(result).toEqual({
        access_token: expect.any(String),
      });
    });
  });

  describe('validateAccount', () => {
    const { username, email, password } = accountStub();
    let result: Account;

    beforeEach(async () => {
      result = await authService.validateAccount(username, password);
    });

    test('calls existsByUsernameOrEmail', () => {
      expect(accountsService.getAccount).toHaveBeenCalledTimes(1);
      expect(accountsService.getAccount).toHaveBeenCalledWith(username);
    });

    it('should validate the account', async () => {
      expect(result).toEqual({ id: expect.any(String), username, email });
    });
  });
});
