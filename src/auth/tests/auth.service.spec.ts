import { resultAccountStub } from './../../accounts/tests/stub/account.stub';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AccountsRepository } from 'src/accounts/accounts.repository';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { AuthService } from '../auth.service';

jest.mock('src/accounts/accounts.repository');

describe('AuthService', () => {
  let authService: AuthService;
  let accountsRepository: AccountsRepository;
  let mockJwtService = {
    sign: jest.fn().mockImplementation(() => ''),
  };
  let mockConfigService = { get: jest.fn(() => '') };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, AccountsRepository, JwtService, ConfigService],
    })
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    authService = module.get<AuthService>(AuthService);
    accountsRepository = module.get<AccountsRepository>(AccountsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create account', () => {
    let dto: CreateAccountDto = accountStub();
    let result: Account;

    beforeEach(async () => {
      result = await authService.register(accountStub());
    });

    test('calls existsByUsername method', () => {
      expect(accountsRepository.existsByUsername).toHaveBeenCalledTimes(1);
      expect(accountsRepository.existsByUsername).toHaveBeenCalledWith(
        dto.username,
      );
    });

    test('calls existsByEmail method', () => {
      expect(accountsRepository.existsByEmail).toHaveBeenCalledTimes(1);
      expect(accountsRepository.existsByEmail).toHaveBeenCalledWith(dto.email);
    });

    test('calls createAccount', () => {
      expect(accountsRepository.createEntity).toHaveBeenCalledTimes(1);
      expect(accountsRepository.createEntity).toHaveBeenCalledWith(dto);
    });

    it('should create an account return that', async () => {
      expect(result).toEqual({ id: expect.any(String), ...dto });
    });
  });

  describe('login to account', () => {
    let dto = resultAccountStub();
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

  describe('validate account', () => {
    let { username, email, password } = accountStub();
    let result: Account;

    beforeEach(async () => {
      result = await authService.validateAccount(username, password);
    });

    test('calls existsByUsernameOrEmail', () => {
      expect(accountsRepository.findByUsernameOrEmail).toHaveBeenCalledTimes(1);
      expect(accountsRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
        username,
      );
    });

    it('should validate the account', async () => {
      expect(result).toEqual({ id: expect.any(String), username, email });
    });
  });
});
